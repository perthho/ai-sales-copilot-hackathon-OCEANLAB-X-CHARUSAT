"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Peer, { MediaConnection } from "peerjs";

interface UseWebRTCCallReturn {
  isReady: boolean;
  isOnCall: boolean;
  callLink: string | null;
  callError: string | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  hangUp: () => void;
}

export function useWebRTCCall(callId: string, isActive: boolean): UseWebRTCCallReturn {
  const [isReady, setIsReady] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callLink, setCallLink] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let destroyed = false;

    async function init() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch {
        setCallError("Microphone permission denied");
        return;
      }

      if (destroyed) { stream.getTracks().forEach(t => t.stop()); return; }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const peerId = `agent-${callId}`;
      const peer = new Peer(peerId);
      peerRef.current = peer;

      peer.on("open", (id) => {
        if (destroyed) return;
        console.log("[webrtc] Peer open:", id);
        setIsReady(true);

        const baseUrl = window.location.origin;
        setCallLink(`${baseUrl}/join/${callId}`);
      });

      peer.on("error", (err) => {
        console.error("[webrtc] Peer error:", err.message);
        if (err.type === "unavailable-id") {
          setCallError("Call session already exists. Refresh and try again.");
        } else {
          setCallError(err.message);
        }
      });

      peer.on("call", (incomingCall) => {
        console.log("[webrtc] Incoming call from customer");
        incomingCall.answer(stream);
        callRef.current = incomingCall;

        incomingCall.on("stream", (customerStream) => {
          console.log("[webrtc] Got customer audio stream");
          setRemoteStream(customerStream);
          setIsOnCall(true);
        });

        incomingCall.on("close", () => {
          console.log("[webrtc] Call closed");
          setIsOnCall(false);
          setRemoteStream(null);
        });

        incomingCall.on("error", (err) => {
          console.error("[webrtc] Call error:", err.message);
          setCallError(err.message);
        });
      });
    }

    init();

    return () => {
      destroyed = true;
      callRef.current?.close();
      peerRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      setIsReady(false);
      setIsOnCall(false);
      setRemoteStream(null);
      setLocalStream(null);
    };
  }, [callId, isActive]);

  const hangUp = useCallback(() => {
    callRef.current?.close();
    peerRef.current?.destroy();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setIsOnCall(false);
    setRemoteStream(null);
  }, []);

  return { isReady, isOnCall, callLink, callError, remoteStream, localStream, hangUp };
}
