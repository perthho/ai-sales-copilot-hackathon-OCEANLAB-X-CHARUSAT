# AI Sales Copilot — CLAUDE.md

## Index
1. [What This Is](#what-this-is)
2. [MVP Scope](#mvp-scope)
3. [Tech Stack](#tech-stack)
4. [Screens](#screens)
5. [Core Architecture](#core-architecture)
6. [UI Style](#ui-style)
7. [Demo Playbook](#demo-playbook)
8. [Environment Variables](#environment-variables)
9. [Dev Conventions](#dev-conventions)
10. [Roadmap](#roadmap)

---

## What This Is

A **live AI teleprompter for sales agents**. The AI listens to the customer call in real time and displays exactly what the agent should say next — the agent just reads it. No suggestions, no options. One line. Always current.

**Core loop:** Customer speaks → Exotel streams audio → Sarvam.ai transcribes → Gemini 2.5 Flash generates agent's next line → teleprompter updates on screen.

Target market: Indian sales teams. Built for OceanLab × CHARUSAT Hackathon (24-hour sprint).

---

## MVP Scope

**In scope:**
- Outbound calling via Exotel (real phone calls)
- Live transcription via Sarvam.ai (multilingual, Indian languages)
- Live teleprompter powered by Gemini 2.5 Flash
- 3 screens: Dashboard, Live Call, Post-Call Summary
- Hardcoded B2B SaaS demo playbook
- Firebase Firestore for call storage
- No auth — demo mode, hardcoded agent

**Out of scope (roadmap):**
- Manager analytics dashboard
- CRM integration (Zoho, HubSpot)
- Auth / roles
- RAG over business documents
- Multiple playbooks
- Mobile app

---

## Tech Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 15 (App Router) | |
| UI | Tailwind CSS v4 + shadcn/ui | Brutalist style |
| Telephony | Exotel | Outbound calls + audio stream |
| STT | Sarvam.ai | Streaming, Indian languages |
| LLM | Gemini 2.5 Flash | `google-genai` SDK — NOT `@google/generative-ai` (EOL Nov 2025) |
| Database | Firebase Firestore | Real-time listeners |
| Auth | None | Demo mode |
| Hosting | Vercel | |

---

## Screens

| Route | Screen | Purpose |
|---|---|---|
| `/dashboard` | Agent Dashboard | Contact list + "Start Call" button |
| `/dashboard/live-call/[callId]` | Live Call | Transcript (top) + Teleprompter (bottom) |
| `/dashboard/summary/[callId]` | Post-Call Summary | Full transcript + AI summary |

---

## Core Architecture

**Call flow:**
1. Agent clicks "Start Call" → `POST /api/call/start` → Exotel initiates outbound call
2. Exotel bridges agent + customer, streams audio to `WS /api/call/audio/[callId]`
3. Server resamples mulaw 8kHz → PCM 16kHz → Sarvam.ai STT
4. Transcript chunks written to Firestore → client `onSnapshot` updates UI
5. Each customer utterance triggers `POST /api/call/teleprompter` → Gemini streams next line
6. Call ends → Exotel webhook → summary generated async

**Key API routes:**
- `POST /api/call/start` — init call + Exotel dial
- `WS /api/call/audio/[callId]` — Exotel audio stream → STT pipeline
- `POST /api/call/teleprompter` — customer utterance → Gemini → streamed response
- `POST /api/call/end` — close call + trigger summary
- `POST /api/exotel/webhook` — Exotel status callbacks

**Firestore schema:**
```
calls/{callId}: { agentId, contactId, status, startedAt, endedAt,
                  transcript[], teleprompterHistory[], summary }
```

---

## UI Style

Minimal / brutalist. Dark background (`#0a0a0a`). Monospace for transcript. Large sans-serif for teleprompter. One accent color. No gradients, no shadows. The teleprompter text is the hero element.

Live call layout: scrolling transcript (top) → large teleprompter block (bottom).

---

## Demo Playbook

Hardcoded Cold Outbound B2B SaaS scenario. Goal: book a 30-min demo. Stages: open → discover → pitch → handle objections → close. Agent lines: 1–3 sentences max. Context cached in Gemini (90% token cost reduction).

---

## Environment Variables

```env
GEMINI_API_KEY=
SARVAM_API_KEY=
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_ACCOUNT_SID=
EXOTEL_AGENT_NUMBER=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=
```

---

## Dev Conventions

- No auth — all routes open, hardcoded `"demo-agent"` user
- TypeScript strict mode, no `any`
- WebSocket logic in `useCallCopilot` hook
- Do NOT poll Firestore — use `onSnapshot` listeners
- Audio resampling (mulaw→PCM) must happen server-side before Sarvam.ai

---

## Roadmap

RAG over docs → Manager dashboard → Auth + roles → Multi-playbook → CRM sync → Gemini Live API (replace Sarvam.ai + Gemini with single pipeline) → Google Search grounding during calls
