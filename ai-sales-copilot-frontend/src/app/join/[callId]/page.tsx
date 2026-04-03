"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { Phone, PhoneOff, Mic } from "lucide-react";

export default function CustomerCallPage() {
  const params = useParams<{ callId: string }>();
  const callId = params.callId;

  const [status, setStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let destroyed = false;

    async function joinCall() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch {
        setError("Microphone permission denied. Please allow mic access.");
        return;
      }

      if (destroyed) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", () => {
        if (destroyed) return;
        setStatus("ringing");

        const agentPeerId = `agent-${callId}`;
        const call = peer.call(agentPeerId, stream);

        call.on("stream", (agentStream) => {
          if (destroyed) return;
          setStatus("connected");
          // Play agent's audio using programmatic audio element
          const audio = document.createElement("audio");
          audio.srcObject = agentStream;
          audio.autoplay = true;
          audio.play().catch(() => {});
        });

        call.on("close", () => {
          setStatus("ended");
        });

        call.on("error", (err) => {
          setError(err.message);
        });
      });

      peer.on("error", (err) => {
        setError(err.message);
      });
    }

    joinCall();

    return () => {
      destroyed = true;
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [callId]);

  function handleHangUp() {
    peerRef.current?.destroy();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStatus("ended");
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6">
      {status === "connecting" && (
        <>
          <div className="size-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Connecting to call...</p>
        </>
      )}

      {status === "ringing" && (
        <>
          <div className="size-16 border-4 border-muted border-t-warning rounded-full animate-spin" />
          <p className="text-warning">Ringing agent...</p>
        </>
      )}

      {status === "connected" && (
        <>
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping bg-success opacity-75 rounded-full" />
              <span className="relative inline-flex size-3 bg-success rounded-full" />
            </span>
            <Mic className="size-5 text-success" />
            <span className="text-success text-lg font-semibold">Connected</span>
          </div>
          <p className="text-muted-foreground text-sm">You are in a call with the sales agent</p>
          <button
            onClick={handleHangUp}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-xl transition-colors"
          >
            <PhoneOff className="size-4" />
            Hang Up
          </button>
        </>
      )}

      {status === "ended" && (
        <>
          <Phone className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">Call ended</p>
          <p className="text-xs text-muted-foreground">You can close this tab.</p>
        </>
      )}

      {error && (
        <p className="text-destructive text-sm mt-4">{error}</p>
      )}
    </div>
  );
}
