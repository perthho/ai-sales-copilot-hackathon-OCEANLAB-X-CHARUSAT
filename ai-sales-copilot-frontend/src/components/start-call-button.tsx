"use client";

import { PhoneCall } from "lucide-react";
import { useStartCall } from "@/components/start-call-dialog";
import { cn } from "@/lib/utils";

export function StartCallFAB() {
  const { open } = useStartCall();
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-[60]">
      <button
        onClick={open}
        className="flex items-center gap-2.5 h-12 px-5 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 text-[13px] font-semibold hover:bg-primary/90 transition-colors"
      >
        <PhoneCall className="size-4" />
        <span className="hidden md:inline">Start Call</span>
      </button>
    </div>
  );
}

export function StartCallInline({ className }: { className?: string }) {
  const { open } = useStartCall();
  return (
    <button onClick={open} className={className}>
      <PhoneCall className="size-4" />
      Start Call
    </button>
  );
}
