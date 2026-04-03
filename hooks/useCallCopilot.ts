"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Call, TranscriptEntry } from "@/types";

interface UseCallCopilotReturn {
  transcript: TranscriptEntry[];
  teleprompterLine: string;
  isGenerating: boolean;
  callStatus: "active" | "ended";
  contactName: string;
  contactCompany: string;
  contactPhone: string;
  startedAt: number | null;
  endCall: () => Promise<void>;
}

export function useCallCopilot(callId: string): UseCallCopilotReturn {
  const router = useRouter();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [teleprompterLine, setTeleprompterLine] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [callStatus, setCallStatus] = useState<"active" | "ended">("active");
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const lastProcessedIndexRef = useRef(-1);
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cooldownUntilRef = useRef(0); // Timestamp — ignore customer entries until this time
  const lastTeleprompterLineRef = useRef(""); // Track last generated line to filter echoes

  const triggerTeleprompter = useCallback(
    async (customerUtterance: string, history: TranscriptEntry[]) => {
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;
      setIsGenerating(true);
      setTeleprompterLine("");

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch("/api/call/teleprompter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId,
            customerUtterance,
            history: history.map(({ speaker, text }) => ({ speaker, text })),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Teleprompter request failed: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let line = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          line += decoder.decode(value, { stream: true });
          setTeleprompterLine(line);
        }

        // Set cooldown — ignore customer entries for 6 seconds after generating a response
        // This prevents the agent's voice echoing through the customer's mic from
        // being misidentified as a new customer utterance and triggering another response
        if (line.trim().length > 0) {
          cooldownUntilRef.current = Date.now() + 6000;
          lastTeleprompterLineRef.current = line.trim().toLowerCase();
        }
      } catch (error: unknown) {
        // AbortError can be DOMException or plain Error depending on the browser
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Teleprompter stream error:", error);
      } finally {
        isGeneratingRef.current = false;
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [callId]
  );

  // Listen to Firestore document for real-time transcript updates
  useEffect(() => {
    const callDocRef = doc(db, "calls", callId);

    const unsubscribe = onSnapshot(
      callDocRef,
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data() as Omit<Call, "id">;

        setContactName(data.contactName);
        setContactCompany(data.contactCompany);
        setContactPhone(data.contactPhone);
        setStartedAt(data.startedAt);

        if (data.status === "ended") {
          setCallStatus("ended");
          return;
        }

        const firestoreTranscript = data.transcript ?? [];

        // Merge Firestore transcript with locally added agent entries
        setTranscript((prev) => {
          // Get locally added agent entries that came after the last Firestore entry
          const localAgentEntries = prev.filter(
            (entry) =>
              entry.speaker === "agent" &&
              !firestoreTranscript.some(
                (ft) =>
                  ft.speaker === "agent" &&
                  ft.text === entry.text &&
                  ft.timestamp === entry.timestamp
              )
          );

          return [...firestoreTranscript, ...localAgentEntries];
        });

        // Check for new customer utterances beyond the last processed index
        const newCustomerIndex = firestoreTranscript.findIndex(
          (entry, index) =>
            index > lastProcessedIndexRef.current &&
            entry.speaker === "customer"
        );

        if (newCustomerIndex !== -1) {
          lastProcessedIndexRef.current = newCustomerIndex;
          const customerEntry = firestoreTranscript[newCustomerIndex];
          const now = Date.now();

          // Echo protection: skip if we're in cooldown period (agent just spoke)
          if (now < cooldownUntilRef.current) {
            console.log("[copilot] Skipping customer entry (cooldown — likely echo):", customerEntry.text);
            return;
          }

          // Echo detection: skip if the customer's text is very similar to what the teleprompter just generated
          const customerText = customerEntry.text.trim().toLowerCase();
          const lastLine = lastTeleprompterLineRef.current;
          if (lastLine && (customerText.includes(lastLine.slice(0, 20)) || lastLine.includes(customerText.slice(0, 20)))) {
            console.log("[copilot] Skipping customer entry (echo of teleprompter):", customerEntry.text);
            return;
          }

          triggerTeleprompter(customerEntry.text, firestoreTranscript);
        }
      },
      (error) => {
        console.error("Firestore snapshot error:", error);
      }
    );

    return () => {
      unsubscribe();
      abortControllerRef.current?.abort();
    };
  }, [callId, triggerTeleprompter]);

  // Redirect to summary page when call ends
  useEffect(() => {
    if (callStatus === "ended") {
      router.push(`/dashboard/summary/${callId}`);
    }
  }, [callStatus, callId, router]);

  const endCall = useCallback(async () => {
    try {
      abortControllerRef.current?.abort();

      const response = await fetch("/api/call/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });

      if (!response.ok) {
        throw new Error(`End call request failed: ${response.status}`);
      }

      router.push(`/dashboard/summary/${callId}`);
    } catch (error) {
      console.error("End call error:", error);
    }
  }, [callId, router]);

  return {
    transcript,
    teleprompterLine,
    isGenerating,
    callStatus,
    contactName,
    contactCompany,
    contactPhone,
    startedAt,
    endCall,
  };
}
