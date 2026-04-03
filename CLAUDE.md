# AI Sales Copilot — CLAUDE.md

## Index
1. [What This Is](#what-this-is)
2. [MVP Scope](#mvp-scope)
3. [Tech Stack](#tech-stack)
4. [Screens](#screens)
5. [Core Architecture](#core-architecture)
6. [Audio & STT Pipeline](#audio--stt-pipeline)
7. [Teleprompter Pipeline](#teleprompter-pipeline)
8. [UI Style](#ui-style)
9. [Demo Playbook](#demo-playbook)
10. [Key Files](#key-files)
11. [Environment Variables](#environment-variables)
12. [Dev Conventions](#dev-conventions)
13. [Known Issues & Decisions](#known-issues--decisions)
14. [Roadmap](#roadmap)

---

## What This Is

A **live AI teleprompter for sales agents**. Agent starts a VoIP call from the browser, customer joins via a shared link (WhatsApp-style). AI listens in real time, transcribes both sides, and generates exactly what the agent should say next.

**Core loop:** Customer speaks → Sarvam.ai transcribes → Gemini 3.1 Flash Lite generates agent's next line → teleprompter updates on screen.

Target: Indian sales teams. Built for OceanLab × CHARUSAT Hackathon.

---

## MVP Scope

**In scope:**
- WebRTC VoIP calling (browser-to-browser via PeerJS)
- Shareable call link for customer (`/call/[callId]`)
- Live STT via Sarvam.ai streaming WebSocket (direct from browser)
- Live teleprompter powered by Gemini 3.1 Flash Lite
- 4 screens: Dashboard, Live Call, Customer Call Page, Post-Call Summary
- Hardcoded B2B SaaS demo playbook
- Firebase Firestore for call state + transcripts
- No auth — demo mode

**Out of scope (roadmap):**
- PSTN calling (Exotel/Twilio — experimental code exists but not active)
- Manager analytics dashboard
- CRM integration
- Auth / roles
- RAG over business documents
- Mobile PWA with push notifications

---

## Tech Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) | Standard `next start`, no custom server needed |
| UI | Tailwind CSS v4 + shadcn/ui | Brutalist dark theme |
| VoIP | PeerJS (WebRTC) | Browser-to-browser audio, PeerJS cloud signaling |
| STT | Sarvam.ai `saaras:v3` | Streaming WebSocket from browser, 23 Indian languages |
| LLM | Gemini 3.1 Flash Lite | `@google/genai` SDK, streaming responses |
| Database | Firebase Firestore | Real-time `onSnapshot` listeners |
| Auth | None | Demo mode, hardcoded agent |
| Hosting | Vercel (deploy) + cloudflared (dev tunnel) | |

---

## Screens

| Route | Screen | Purpose |
|---|---|---|
| `/dashboard` | Agent Dashboard | Contact list + "Start Call" button |
| `/dashboard/live-call/[callId]` | Live Call | Transcript (top) + Teleprompter (bottom) + call link |
| `/call/[callId]` | Customer Call | Simple page customer opens to join WebRTC call |
| `/dashboard/summary/[callId]` | Post-Call Summary | Full transcript + AI summary |

---

## Core Architecture

**Call flow:**
1. Agent clicks "Start Call" → `POST /api/call/start` → Firestore doc created
2. Agent's browser creates PeerJS peer (`agent-{callId}`)
3. Shareable link shown: `/call/{callId}` — agent sends to customer
4. Customer opens link → PeerJS connects → WebRTC audio established
5. Both audio streams captured → Sarvam.ai STT (browser-direct WebSocket)
6. Transcripts written to Firestore → UI updates via `onSnapshot`
7. Customer utterance detected → `POST /api/call/teleprompter` → Gemini streams response
8. Agent reads teleprompter line → customer responds → loop repeats
9. Agent clicks "End Call" → `POST /api/call/end` → AI summary generated

**API routes:**
- `POST /api/call/start` — create Firestore call doc, return callId + phone
- `POST /api/call/teleprompter` — Gemini streaming (customer utterance → agent line)
- `POST /api/call/end` — mark call ended, generate AI summary
- `POST /api/stt` — fallback REST STT via Sarvam.ai (not primary path)

**Firestore schema:**
```
calls/{callId}: { agentId, contactId, contactName, contactCompany, contactPhone,
                  status, startedAt, endedAt, transcript[], teleprompterHistory[], summary }
```

---

## Audio & STT Pipeline

**How transcription works (browser-side, no server needed):**

1. `useStreamSTT` hook attaches to a `MediaStream` (agent or customer)
2. `AudioContext` at 16kHz + `ScriptProcessorNode` captures raw PCM
3. Float32 → Int16 → base64 conversion in browser
4. WebSocket to `wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saaras:v3`
5. Auth via WebSocket subprotocol: `api-subscription-key.{SARVAM_API_KEY}`
6. PCM chunks sent every 250ms as `{ audio: { data: base64, sample_rate: 16000, encoding: "pcm" } }`
7. Sarvam handles VAD internally → returns `{ type: "data", data: { transcript: "..." } }`
8. Transcript written to Firestore via client SDK → `onSnapshot` updates UI

**Two STT instances run simultaneously:** one for agent mic, one for customer audio.

---

## Teleprompter Pipeline

1. `useCallCopilot` hook listens to Firestore `onSnapshot`
2. Detects new `customer` transcript entry
3. **Echo protection**: skips if within 6-second cooldown (agent just spoke) or if text matches the last teleprompter line (echo of agent's voice through customer's mic)
4. POSTs to `/api/call/teleprompter` with customer utterance + conversation history
5. Server streams Gemini 3.1 Flash Lite response (system prompt = demo playbook)
6. Client reads stream chunk-by-chunk → teleprompter text updates live
7. After generation: sets 6-second cooldown to prevent echo feedback loop
6. Completed line appended to transcript as `speaker: "agent"`

---

## UI Style

Minimal / brutalist. Dark `#0a0a0a`. Monospace for transcript. Large sans-serif for teleprompter. Accent: `#00ff88`. No gradients, no shadows. Teleprompter is the hero element.

Live call layout: call link banner (top) → scrolling transcript (55%) → teleprompter block (45%).

---

## Demo Playbook

Hardcoded Cold Outbound B2B SaaS for "ReportFlow". Goal: book a 30-min demo. Stages: open → discover → pitch → handle objections → close. Agent lines: 1–3 sentences. Matches customer's language (Hindi/English/Hinglish). System prompt in `lib/gemini.ts`.

---

## Key Files

| File | Purpose |
|---|---|
| `hooks/useCallCopilot.ts` | Firestore listener + teleprompter trigger |
| `hooks/useWebRTCCall.ts` | PeerJS WebRTC call management |
| `hooks/useStreamSTT.ts` | Browser → Sarvam.ai streaming WebSocket |
| `lib/gemini.ts` | Gemini client, playbook prompt, streaming helpers |
| `lib/firebase.ts` | Firestore client SDK |
| `lib/firebase-admin.ts` | Firestore admin (lazy init for build safety) |
| `app/call/[callId]/page.tsx` | Customer-facing call join page |
| `types/index.ts` | Shared types + demo contacts |

---

## Environment Variables

```env
# Gemini — model: gemini-3.1-flash-lite-preview
GEMINI_API_KEY=

# Sarvam.ai — streaming STT (server-side)
SARVAM_API_KEY=
# Sarvam.ai — browser-side WebSocket (same key, exposed to client)
NEXT_PUBLIC_SARVAM_API_KEY=

# Firebase — client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Firebase — admin
FIREBASE_SERVICE_ACCOUNT_KEY=   # JSON string

# App
NEXT_PUBLIC_APP_URL=            # Public URL (cloudflared tunnel or Vercel)
```

---

## Dev Conventions

- No auth — all routes open, hardcoded `"demo-agent"` user
- TypeScript strict mode, no `any`
- `reactStrictMode: false` in next.config (prevents double-mount WebSocket issues)
- Do NOT use `<audio>` elements in JSX — create programmatically in `useEffect` to avoid React DOM errors
- Firestore: always `onSnapshot`, never poll
- STT runs browser-side via WebSocket — no server proxy needed
- Use `next build && next start` for testing (not `next dev`) when behind a tunnel

---

## Known Issues & Decisions

- **Exotel PSTN calling**: Code exists (`lib/exotel.ts`, `server.ts`) but disabled. Exotel's Voicebot applet disconnects with 1006 on free trial. Parked for future fix.
- **Twilio**: Code exists (`hooks/useTwilioCall.ts`, `app/api/twilio/`) but not active. Can be re-enabled for PSTN calling.
- **Sarvam API key exposed**: `NEXT_PUBLIC_SARVAM_API_KEY` is in the browser. Acceptable for hackathon demo. Production: proxy through server.
- **ScriptProcessorNode deprecated**: Using it for audio capture. Works in all browsers. Migration to AudioWorklet is a future task.

---

## Roadmap

1. PSTN calling via Exotel/Twilio (fix Voicebot integration)
2. PWA with push notifications for customer (incoming call ring)
3. RAG over uploaded business documents (replace hardcoded playbook)
4. Manager analytics dashboard
5. Auth with agent/manager roles
6. CRM integration (Zoho, HubSpot)
7. Gemini Live API (single pipeline for STT + LLM)
