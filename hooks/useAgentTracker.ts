"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const SARVAM_API_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY ?? "";
const SARVAM_WS_URL = "wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saaras:v3";
const DELIVERY_THRESHOLD = 0.5; // 50% word match = agent has delivered the line

/**
 * Tracks the agent reading the teleprompter line word-by-word.
 * Runs STT on the agent's mic, compares output against the expected text.
 * Returns progress (0-1) and whether delivery is complete.
 */
export function useAgentTracker(
  stream: MediaStream | null,
  teleprompterLine: string,
  isActive: boolean
) {
  const [spokenWordCount, setSpokenWordCount] = useState(0);
  const [isDelivered, setIsDelivered] = useState(false);
  const [totalWords, setTotalWords] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pcmBufferRef = useRef<Int16Array[]>([]);
  const allTranscribedRef = useRef("");
  const targetWordsRef = useRef<string[]>([]);
  const deliveredRef = useRef(false);

  // Reset when teleprompter line changes
  useEffect(() => {
    const words = teleprompterLine.trim().split(/\s+/).filter(Boolean);
    targetWordsRef.current = words.map(w => w.toLowerCase().replace(/[^\w\s]/g, ""));
    setTotalWords(words.length);
    setSpokenWordCount(0);
    setIsDelivered(false);
    deliveredRef.current = false;
    allTranscribedRef.current = "";
  }, [teleprompterLine]);

  // Start/stop STT based on stream + active + has teleprompter text
  useEffect(() => {
    if (!stream || !isActive || !teleprompterLine.trim() || !SARVAM_API_KEY) return;

    let destroyed = false;
    const pcmBuffer: Int16Array[] = [];

    // Audio capture at 16kHz
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
    scriptNodeRef.current = scriptNode;

    scriptNode.onaudioprocess = (e) => {
      if (destroyed || deliveredRef.current) return;
      const input = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      pcmBuffer.push(int16);
    };

    source.connect(scriptNode);
    scriptNode.connect(audioContext.destination);

    // WebSocket to Sarvam
    const ws = new WebSocket(SARVAM_WS_URL, [`api-subscription-key.${SARVAM_API_KEY}`]);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "data" && msg.data?.transcript) {
          const transcript = msg.data.transcript.trim().toLowerCase();
          if (!transcript) return;

          allTranscribedRef.current += " " + transcript;

          // Count how many target words have been spoken
          const spokenText = allTranscribedRef.current;
          let matched = 0;
          for (const word of targetWordsRef.current) {
            if (word && spokenText.includes(word)) matched++;
          }

          setSpokenWordCount(matched);

          const progress = targetWordsRef.current.length > 0
            ? matched / targetWordsRef.current.length
            : 0;

          if (progress >= DELIVERY_THRESHOLD && !deliveredRef.current) {
            deliveredRef.current = true;
            setIsDelivered(true);
            console.log("[tracker] Agent delivered the teleprompter line");
          }
        }
      } catch { /* ignore */ }
    };

    // Send audio every 250ms
    const interval = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN || pcmBuffer.length === 0 || deliveredRef.current) return;
      const totalLen = pcmBuffer.reduce((s, b) => s + b.length, 0);
      const merged = new Int16Array(totalLen);
      let offset = 0;
      for (const buf of pcmBuffer) { merged.set(buf, offset); offset += buf.length; }
      pcmBuffer.length = 0;

      const bytes = new Uint8Array(merged.buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);

      ws.send(JSON.stringify({
        audio: { data: btoa(binary), sample_rate: 16000, encoding: "audio/wav" },
      }));
    }, 250);
    sendIntervalRef.current = interval;

    return () => {
      destroyed = true;
      clearInterval(interval);
      if (scriptNode) { scriptNode.disconnect(); scriptNode.onaudioprocess = null; }
      if (audioContext) audioContext.close().catch(() => {});
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [stream, isActive, teleprompterLine]);

  const reset = useCallback(() => {
    setSpokenWordCount(0);
    setIsDelivered(false);
    deliveredRef.current = false;
    allTranscribedRef.current = "";
  }, []);

  return {
    spokenWordCount,
    totalWords,
    isDelivered,
    progress: totalWords > 0 ? spokenWordCount / totalWords : 0,
    reset,
  };
}
