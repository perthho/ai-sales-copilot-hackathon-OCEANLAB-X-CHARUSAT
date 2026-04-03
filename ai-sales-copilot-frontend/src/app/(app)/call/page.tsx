"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCallCopilot } from "@/hooks/useCallCopilot";
import { useWebRTCCall } from "@/hooks/useWebRTCCall";
import { useStreamSTT } from "@/hooks/useStreamSTT";
import {
  Building,
  Mic,
  PhoneOff,
  PhoneForwarded,
  FileText,
  Send,
  Bot,
  Sparkles,
  CloudUpload,
  MicOff,
  Volume2,
  Copy,
  Check,
  LinkIcon,
} from "lucide-react";

/* ---------- Transcript Bubble ---------- */
function TranscriptBubble({
  speaker,
  isUser,
  time,
  text,
  isLive,
  speakerSize,
  timeSize,
  bodySize,
}: {
  speaker: string;
  isUser: boolean;
  time: string;
  text: string;
  isLive?: boolean;
  speakerSize?: number;
  timeSize?: number;
  bodySize?: number;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${isLive ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-2">
        <span
          className={`font-semibold ${isUser ? "text-primary" : "text-secondary"}`}
          style={{ fontSize: speakerSize ? `${speakerSize}px` : undefined }}
        >
          {speaker}
        </span>
        {time && (
          <span className="text-muted-foreground" style={{ fontSize: timeSize ? `${timeSize}px` : undefined }}>
            {time}
          </span>
        )}
        {isLive && (
          <span className="flex items-center gap-1 ml-1">
            <span className="size-1 bg-primary rounded-full animate-pulse" />
            <span className="size-1 bg-primary rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="size-1 bg-primary rounded-full animate-pulse [animation-delay:300ms]" />
          </span>
        )}
      </div>
      {isLive ? (
        <div className="h-4 w-40 bg-muted rounded-full" />
      ) : (
        <p className="text-foreground/80 leading-relaxed" style={{ fontSize: bodySize ? `${bodySize}px` : undefined }}>
          {text}
        </p>
      )}
    </div>
  );
}

/* ---------- Drag Handle ---------- */
function usePanelResize(initialWidth: number, minWidth: number, maxWidth: number) {
  const [width, setWidth] = useState(initialWidth);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.min(maxWidth, Math.max(minWidth, e.clientX - rect.left));
      setWidth(newWidth);
    }
    function onMouseUp() {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [minWidth, maxWidth]);

  return { width, onMouseDown, containerRef };
}

/* ---------- Continuous font size from right panel width ---------- */
function useScaledSize(containerRef: React.RefObject<HTMLDivElement | null>, leftWidth: number) {
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    function calc() {
      if (!containerRef.current) return;
      const totalWidth = containerRef.current.getBoundingClientRect().width;
      const rightWidth = totalWidth - leftWidth;
      const r = Math.max(0, Math.min(1, (rightWidth - 200) / 700));
      setRatio(r);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [containerRef, leftWidth]);

  return ratio;
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function formatDuration(startedAt: number | null) {
  if (!startedAt) return "00:00";
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatTimestamp(ts: number, startedAt: number | null) {
  if (!startedAt) return "";
  const diff = Math.floor((ts - startedAt) / 1000);
  const m = Math.floor(diff / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ---------- Wrapper for Suspense ---------- */
export default function LiveCallPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="size-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LiveCallPage />
    </Suspense>
  );
}

/* ---------- Page ---------- */
function LiveCallPage() {
  const searchParams = useSearchParams();
  const callId = searchParams.get("id") ?? "";

  // Core hooks
  const {
    transcript,
    teleprompterLine,
    isGenerating,
    callStatus,
    contactName,
    contactCompany,
    startedAt,
    endCall,
  } = useCallCopilot(callId);

  const { isReady, isOnCall, callLink, callError, remoteStream, localStream, hangUp } =
    useWebRTCCall(callId, callStatus === "active");

  // STT for both agent (local mic) and customer (remote) audio
  useStreamSTT(localStream, callId, "agent", isOnCall || isReady);
  useStreamSTT(remoteStream, callId, "customer", isOnCall);

  // Play remote audio via programmatic <audio> element (no JSX <audio>)
  useEffect(() => {
    if (!remoteStream) return;
    const audio = document.createElement("audio");
    audio.srcObject = remoteStream;
    audio.autoplay = true;
    audio.play().catch(() => {});
    return () => {
      audio.srcObject = null;
      audio.remove();
    };
  }, [remoteStream]);

  // Duration timer
  const [duration, setDuration] = useState("00:00");
  useEffect(() => {
    if (!startedAt || callStatus !== "active") return;
    const interval = setInterval(() => setDuration(formatDuration(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt, callStatus]);

  // Copy link state
  const [copied, setCopied] = useState(false);
  function copyLink() {
    if (!callLink) return;
    navigator.clipboard.writeText(callLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Mute toggle
  const [isMuted, setIsMuted] = useState(false);
  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  }

  const { width: leftWidth, onMouseDown, containerRef } = usePanelResize(380, 240, 600);
  const scale = useScaledSize(containerRef, leftWidth);

  // Right panel scales
  const fontSize = Math.round(lerp(14, 22, scale));
  const padding = Math.round(lerp(16, 40, scale));
  const gap = Math.round(lerp(12, 24, scale));
  const labelSize = Math.round(lerp(10, 13, scale));

  // Left panel scales
  const leftScale = Math.max(0, Math.min(1, (leftWidth - 240) / 360));
  const tBodySize = Math.round(lerp(12, 15, leftScale));
  const tSpeakerSize = Math.round(lerp(11, 13, leftScale));
  const tTimeSize = Math.round(lerp(9, 11, leftScale));

  // Auto-scroll transcript
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (!callId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">No active call. Start a call from the dashboard.</p>
      </div>
    );
  }

  async function handleEndCall() {
    hangUp();
    await endCall();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">

      {/* Call link banner */}
      {callLink && !isOnCall && (
        <div className="px-4 md:px-6 py-2.5 bg-primary/5 border-b border-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <LinkIcon className="size-4" />
            <span className="hidden md:inline">Share this link with the customer:</span>
            <code className="bg-primary/10 px-2 py-0.5 rounded text-xs font-mono truncate max-w-[300px]">
              {callLink}
            </code>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Call header */}
      <div className="px-4 md:px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
              <Building className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-heading font-semibold text-foreground">
                  {contactCompany || "Connecting..."}
                </h1>
                <span className="flex items-center gap-1.5 h-5 px-2 rounded-full bg-success/10 text-success text-[11px] font-medium">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  {isOnCall ? "Connected" : isReady ? "Waiting for customer" : "Setting up..."}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground">
                {contactName ? `Call with ${contactName}` : "Initializing call..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-heading font-bold text-foreground tabular-nums">{duration}</p>
            </div>
            <span className="md:hidden text-[15px] font-heading font-bold text-foreground tabular-nums">{duration}</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {callError && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-b border-destructive/20">
          {callError}
        </div>
      )}

      {/* Two-column content with draggable divider */}
      <div ref={containerRef} className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left: Transcription */}
        <section
          className="flex flex-col border-r border-border min-h-0 max-h-[40vh] lg:max-h-none bg-card"
        >
          <style>{`
            @media (min-width: 1024px) {
              .transcript-panel { width: ${leftWidth}px !important; min-width: 240px; max-width: 600px; }
            }
          `}</style>
          <div className="transcript-panel flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold text-foreground">Transcript</h2>
              </div>
              <span className="text-[11px] text-success font-medium">
                {transcript.length > 0 ? `${transcript.length} messages` : "Real-time"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
              {transcript.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {isOnCall
                    ? "Listening... speak to start the transcript."
                    : "Waiting for customer to join..."}
                </p>
              )}
              {transcript.map((entry, i) => (
                <TranscriptBubble
                  key={`${entry.timestamp}-${i}`}
                  speaker={entry.speaker === "agent" ? "You (Agent)" : contactName || "Customer"}
                  isUser={entry.speaker === "agent"}
                  time={formatTimestamp(entry.timestamp, startedAt)}
                  text={entry.text}
                  speakerSize={tSpeakerSize}
                  timeSize={tTimeSize}
                  bodySize={tBodySize}
                />
              ))}
              {isGenerating && (
                <TranscriptBubble
                  speaker="You (Agent)"
                  isUser
                  time=""
                  text=""
                  isLive
                  speakerSize={tSpeakerSize}
                  timeSize={tTimeSize}
                  bodySize={tBodySize}
                />
              )}
              <div ref={transcriptEndRef} />
            </div>

            <div className="px-4 py-2.5 border-t border-border flex items-center gap-2 text-muted-foreground">
              <Mic className="size-3.5 text-success" />
              <span className="text-xs">
                {isOnCall ? "Listening..." : isReady ? "Mic ready, waiting for customer..." : "Setting up microphone..."}
              </span>
            </div>
          </div>
        </section>

        {/* Drag handle — desktop only */}
        <div
          onMouseDown={onMouseDown}
          className="hidden lg:flex w-2 hover:w-3 items-center justify-center cursor-col-resize group transition-all shrink-0 relative z-10 -ml-1 -mr-1"
        >
          <div className="w-0.5 h-8 rounded-full bg-border group-hover:bg-primary/40 group-active:bg-primary transition-colors" />
        </div>

        {/* Right: AI Suggestions / Teleprompter */}
        <section className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-secondary" />
              <h2 className="text-[13px] font-semibold text-foreground">AI Co-Pilot</h2>
            </div>
            <span className="text-[11px] text-secondary font-medium">
              {isGenerating ? "Generating..." : teleprompterLine ? "Ready" : "Listening"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-5 custom-scrollbar">
            {/* Teleprompter — the main AI suggestion */}
            {teleprompterLine ? (
              <div
                className="rounded-3xl border-2 border-primary/30 bg-primary/[0.04]"
                style={{ padding: `${padding}px`, display: "flex", flexDirection: "column", gap: `${gap}px` }}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles style={{ width: labelSize + 4, height: labelSize + 4 }} className="text-primary" />
                  <span
                    className="font-semibold text-primary uppercase tracking-wide"
                    style={{ fontSize: `${labelSize}px` }}
                  >
                    {isGenerating ? "Generating Response..." : "Recommended Response"}
                  </span>
                </div>

                <p
                  className="text-foreground leading-relaxed"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  &quot;{teleprompterLine}&quot;
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bot className="size-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">
                  {isOnCall
                    ? "AI suggestions will appear here when the customer speaks..."
                    : "Waiting for call to connect..."}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom bar — desktop */}
      <footer className="hidden md:flex h-14 border-t border-border items-center px-6 justify-between bg-card">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-8 px-3 rounded-lg bg-muted text-[13px] font-medium text-foreground hover:bg-muted/70 transition-colors">
            <CloudUpload className="size-3.5 text-muted-foreground" />
            Log to Zoho
          </button>
          <button className="flex items-center gap-2 h-8 px-3 rounded-lg bg-muted text-[13px] font-medium text-foreground hover:bg-muted/70 transition-colors">
            <Send className="size-3.5 text-muted-foreground" />
            WhatsApp Draft
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`size-9 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>
          <button className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Volume2 className="size-4" />
          </button>
          <div className="h-6 w-px bg-border mx-1" />
          <button className="flex items-center gap-2 h-8 px-4 rounded-lg bg-primary/10 text-primary text-[13px] font-medium hover:bg-primary/20 transition-colors">
            <PhoneForwarded className="size-3.5" />
            Transfer
          </button>
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 h-8 px-4 rounded-lg bg-destructive/10 text-destructive text-[13px] font-medium hover:bg-destructive/20 transition-colors"
          >
            <PhoneOff className="size-3.5" />
            End Call
          </button>
        </div>
      </footer>

      {/* Mobile bottom bar */}
      <footer className="md:hidden flex h-16 border-t border-border items-center px-4 justify-between bg-card">
        <button
          onClick={toggleMute}
          className={`size-10 rounded-full flex items-center justify-center ${
            isMuted ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          }`}
        >
          {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
        <button
          onClick={handleEndCall}
          className="flex items-center gap-2 h-10 px-6 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold"
        >
          <PhoneOff className="size-4" />
          End Call
        </button>
      </footer>
    </div>
  );
}
