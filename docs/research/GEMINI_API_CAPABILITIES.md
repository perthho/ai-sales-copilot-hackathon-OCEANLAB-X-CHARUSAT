# Gemini API Capabilities Research

## Research Date: 2026-03-04

## Current Model Lineup (March 2026)

### Latest Generation (Gemini 3.x)

| Model | Input/1M tokens | Output/1M tokens | Notes |
|-------|----------------|------------------|-------|
| Gemini 3.1 Pro Preview | $2.00 / $4.00 | $12.00 / $18.00 | Most intelligent |
| Gemini 3 Flash Preview | $0.50 | $3.00 | Frontier-class at reduced cost |
| Gemini 3.1 Flash-Lite Preview | $0.25 / $0.50 | $1.50 | Cost-optimized, fastest |

### Production (Gemini 2.5) -- Recommended for Friday

| Model | Input/1M tokens | Output/1M tokens | Context | Notes |
|-------|----------------|------------------|---------|-------|
| **Gemini 2.5 Flash** | $0.30 / $1.00 (audio) | $2.50 | 1M tokens | **Best for Friday** |
| Gemini 2.5 Flash-Lite | $0.10 / $0.30 | $0.40 | 1M tokens | Ultra-cheap |
| Gemini 2.5 Pro | $1.25 / $2.50 | $10.00 / $15.00 | 1M tokens | Complex reasoning |
| Gemini 2.5 Flash Live | Special pricing | — | 128K (native audio) | Real-time voice |

### Deprecated (Avoid)

- Gemini 2.0 Flash / Flash-Lite — Sunsetting June 1, 2026
- Gemini 3 Pro — Deprecated March 9, 2026

---

## Live API (Voice Pipeline)

### Architecture

- WebSocket-based bidirectional streaming
- Audio in: 16-bit PCM, 16kHz, mono
- Audio out: 24kHz sample rate
- Full-duplex: send audio while receiving audio

### Key Features

| Feature | Detail |
|---------|--------|
| **VAD** | Automatic, configurable sensitivity |
| **Interruption handling** | User speaks → agent stops, responds to new input |
| **Proactive audio** | Model decides when to respond vs stay silent |
| **Affective dialogue** | Interprets emotional tone, empathizes, matches energy |
| **30 HD voices** | 24 languages with automatic switching |
| **Session resumption** | Resume within 24 hours, context preserved |
| **Tool calling** | Google Search + custom functions during voice |

### Session Limits

- **Audio-only: 15 minutes max** (resumable)
- **Audio + video: 2 minutes max** (resumable)
- **Context window: 128K tokens** (not full 1M)
- Context window compression available for longer sessions

### Supported Models for Live API

- `gemini-2.5-flash-native-audio-preview-12-2025` (Google AI Studio)
- `gemini-live-2.5-flash-native-audio` (Vertex AI)

---

## Function Calling / Tool Use

### Modes

| Mode | Behavior |
|------|----------|
| **AUTO** (default) | Model decides whether to call a function |
| **ANY** | Forces function call, guarantees schema |
| **NONE** | Disables function calling |
| **VALIDATED** | Schema adherence while model chooses |

### Capabilities

- **Parallel calling:** Multiple independent functions in one turn
- **Sequential chaining:** Output of one feeds into next
- **Automatic calling** (Python SDK): Converts functions with type hints directly
- **MCP support:** Built into SDK

### Live API Tool Use

- Google Search: Supported
- Custom functions: Supported (manual response handling)
- Non-blocking scheduling: `INTERRUPT`, `WHEN_IDLE`, `SILENT`
- Code execution: NOT supported in Live API

---

## Google Search Grounding

```python
from google.genai import types

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What's the cricket score?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )
)
# Returns: grounded answer + search queries + source URLs + citation mappings
```

### Available in Live API — Friday can search Google during voice conversations.

### Pricing

- Gemini 2.5: $35 per 1,000 search-using prompts
- Gemini 3+: $14 per 1,000 search queries
- Gemini 3.1: 5,000 prompts/month free

---

## Context Caching

### Implicit (Automatic)

- Enabled by default
- 90% discount on Gemini 2.5+ for repeated content
- No developer action needed

### Explicit (Developer-Controlled)

```python
cache = client.caches.create(
    model="gemini-2.5-flash",
    config=types.CreateCachedContentConfig(
        system_instruction="You are Friday...",
        contents=[tool_definitions],
        ttl="3600s",
    )
)
```

- 90% discount on cached tokens
- Cache Friday's personality + tool definitions
- Significant cost savings for always-on usage

---

## Multimodal Capabilities

| Modality | Input | Output |
|----------|-------|--------|
| **Text** | Yes | Yes |
| **Audio** | Yes (native) | Yes (Live API) |
| **Images** | Yes | Yes (Imagen 4) |
| **Video** | Yes (native) | Yes (Veo 3.1) |
| **PDF** | Yes | — |

### Camera Feed Processing

Friday can send camera frames to Gemini during voice sessions:

```python
image_blob = types.Blob(mime_type="image/jpeg", data=frame_bytes)
live_request_queue.send_realtime(image_blob)
# Gemini processes the image and can comment on what it sees
```

---

## Python SDK

### Installation

```bash
pip install google-genai  # New unified SDK
# OLD: google-generativeai (EOL November 2025)
```

### Key Patterns

```python
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_KEY")

# Standard generation
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello!",
    config=types.GenerateContentConfig(
        system_instruction="You are Friday...",
        tools=[google_search_tool, custom_functions],
    )
)

# Streaming
for chunk in client.models.generate_content_stream(...):
    print(chunk.text)

# Live API (async)
async with client.aio.live.connect(model=model, config=config) as session:
    # Bidirectional audio streaming
    ...
```

---

## Free Tier

| Model | RPM | TPM | RPD |
|-------|-----|-----|-----|
| Gemini 2.5 Pro | 5 | 250K | 100 |
| Gemini 2.5 Flash | 10 | 250K | 250 |
| Gemini 2.5 Flash-Lite | 15 | 250K | 1,000 |

**Caveats:**
- Google may use free-tier data for training
- Not available in EU/EEA/UK/Switzerland
- Quotas reduced 50-80% in December 2025
- Insufficient for always-on usage — paid tier needed

---

## Monthly Cost Estimate for Friday

| Component | Estimate |
|-----------|----------|
| Gemini 2.5 Flash (main) | ~$5-10/mo |
| Google Search grounding | ~$5-15/mo |
| Context caching savings | -30-50% |
| **Total estimated** | **~$5-15/month** |

## Key Sources

- [Gemini API Models](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Google Search Grounding](https://ai.google.dev/gemini-api/docs/google-search)
- [Context Caching](https://ai.google.dev/gemini-api/docs/caching)
- [google-genai Python SDK](https://github.com/googleapis/python-genai)
