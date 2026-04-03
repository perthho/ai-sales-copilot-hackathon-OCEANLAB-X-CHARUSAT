import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DEMO_AGENT_ID } from "@/types";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("calls")
      .where("agentId", "==", DEMO_AGENT_ID)
      .orderBy("startedAt", "desc")
      .limit(20)
      .get();

    const calls = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ calls });
  } catch (error) {
    console.error("List calls error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
