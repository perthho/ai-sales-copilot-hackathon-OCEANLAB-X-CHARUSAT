import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DEMO_CONTACTS, DEMO_AGENT_ID } from "@/types";

interface StartCallRequestBody {
  contactId: string;
  // For ad-hoc contacts created from the dialog
  contactName?: string;
  contactCompany?: string;
  contactPhone?: string;
}

export async function POST(request: Request) {
  try {
    const body: StartCallRequestBody = await request.json();
    const { contactId, contactName, contactCompany, contactPhone } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    // Try to find in demo contacts first, fall back to provided details
    const demoContact = DEMO_CONTACTS.find((c) => c.id === contactId);
    const name = demoContact?.name ?? contactName ?? "Unknown";
    const company = demoContact?.company ?? contactCompany ?? "";
    const phone = demoContact?.phone ?? contactPhone ?? "";

    const callDoc = await adminDb.collection("calls").add({
      agentId: DEMO_AGENT_ID,
      contactId,
      contactName: name,
      contactCompany: company,
      contactPhone: phone,
      status: "active",
      startedAt: Date.now(),
      endedAt: null,
      transcript: [],
      teleprompterHistory: [],
      summary: null,
    });

    return NextResponse.json({
      callId: callDoc.id,
      phone,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to start call:", message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
