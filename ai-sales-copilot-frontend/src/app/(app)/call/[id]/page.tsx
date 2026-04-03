"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Call } from "@/types";
import {
  ArrowLeft,
  Clock,
  BarChart3,
  MessageSquare,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

/* ---------- Transcript Line ---------- */
function TranscriptLine({
  speaker,
  isUser,
  time,
  text,
}: {
  speaker: string;
  isUser: boolean;
  time: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 py-3 px-3 rounded-lg">
      <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
        isUser ? "bg-accent text-primary" : "bg-muted text-muted-foreground"
      }`}>
        {isUser ? "AG" : "CU"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold ${isUser ? "text-primary" : "text-secondary"}`}>{speaker}</span>
          <span className="text-[11px] text-muted-foreground">{time}</span>
        </div>
        <p className="text-[13px] text-foreground/80 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function formatDurationFromMs(startedAt: number, endedAt: number | null) {
  const end = endedAt ?? Date.now();
  const seconds = Math.floor((end - startedAt) / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatTimestamp(ts: number, startedAt: number) {
  const diff = Math.floor((ts - startedAt) / 1000);
  const m = Math.floor(diff / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ---------- Page ---------- */
export default function CallDetailPage() {
  const params = useParams<{ id: string }>();
  const callId = params.id;

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) return;
    const callDocRef = doc(db, "calls", callId);
    const unsubscribe = onSnapshot(callDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setCall({ id: snapshot.id, ...snapshot.data() } as Call);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [callId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="size-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Call not found.</p>
      </div>
    );
  }

  const duration = formatDurationFromMs(call.startedAt, call.endedAt);
  const transcript = call.transcript ?? [];
  const customerMessages = transcript.filter((t) => t.speaker === "customer").length;
  const agentMessages = transcript.filter((t) => t.speaker === "agent").length;

  return (
    <div className="p-4 md:p-8 max-w-[1200px] space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
              {call.contactCompany} — {call.contactName}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {new Date(call.startedAt).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {new Date(call.startedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {call.status === "ended" && " · Call ended"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium ${
              call.status === "active"
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}>
              <span className={`size-1.5 rounded-full ${
                call.status === "active" ? "bg-success animate-pulse" : "bg-muted-foreground"
              }`} />
              {call.status === "active" ? "Live" : "Ended"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Duration", value: duration },
          { icon: MessageSquare, label: "Messages", value: `${transcript.length} total` },
          { icon: BarChart3, label: "Customer", value: `${customerMessages} messages` },
          { icon: TrendingUp, label: "Agent", value: `${agentMessages} messages` },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-foreground">Full Transcript</h3>
              <span className="text-xs text-muted-foreground">{transcript.length} exchanges</span>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto custom-scrollbar">
              {transcript.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transcript recorded.</p>
              ) : (
                transcript.map((entry, i) => (
                  <TranscriptLine
                    key={`${entry.timestamp}-${i}`}
                    speaker={entry.speaker === "agent" ? "Agent" : call.contactName}
                    isUser={entry.speaker === "agent"}
                    time={formatTimestamp(entry.timestamp, call.startedAt)}
                    text={entry.text}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Summary + Info */}
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-secondary" />
              <h3 className="text-[13px] font-semibold text-foreground">AI Summary</h3>
            </div>
            {call.summary ? (
              <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {call.summary}
              </p>
            ) : (
              <p className="text-[13px] text-muted-foreground italic">
                {call.status === "active"
                  ? "Summary will be generated when the call ends."
                  : "Generating summary..."}
              </p>
            )}
          </div>

          {/* Teleprompter History */}
          {call.teleprompterHistory.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-[13px] font-semibold text-foreground mb-3">
                AI Suggestions Used ({call.teleprompterHistory.length})
              </h3>
              <div className="space-y-3">
                {call.teleprompterHistory.map((line, i) => (
                  <div key={i} className="bg-primary/5 rounded-lg p-3">
                    <p className="text-[13px] text-foreground/80 leading-relaxed">&quot;{line}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call Info */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground mb-3">Call Details</h3>
            <div className="space-y-2">
              {[
                { label: "Contact", value: call.contactName },
                { label: "Company", value: call.contactCompany },
                { label: "Phone", value: call.contactPhone },
                { label: "Status", value: call.status === "active" ? "In Progress" : "Completed" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-[13px] text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CRM Sync Status */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[13px] font-semibold text-foreground mb-3">Status</h3>
            <div className="space-y-2">
              {[
                { label: "Transcript saved", done: transcript.length > 0 },
                { label: "AI summary generated", done: !!call.summary },
                { label: "Call ended cleanly", done: call.status === "ended" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <CheckCircle2 className={`size-4 ${item.done ? "text-success" : "text-muted-foreground"}`} />
                  <span className={`text-[13px] ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
