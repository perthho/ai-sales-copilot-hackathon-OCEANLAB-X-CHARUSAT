# Sarvam.ai Speech-to-Text API -- Complete Research

> Last updated: 2026-04-03
> Sources: docs.sarvam.ai, github.com/sarvamai, sarvam.ai/apis, pipecat docs, npm registry

---

## Table of Contents

1. [REST API](#1-rest-api)
2. [Streaming (WebSocket) API](#2-streaming-websocket-api)
3. [Supported Audio Formats & MIME Types](#3-supported-audio-formats--mime-types)
4. [Browser MediaRecorder (webm/opus) -- The Problem & Solutions](#4-browser-mediarecorder-webmopus----the-problem--solutions)
5. [Models: Saarika vs Saaras](#5-models-saarika-vs-saaras)
6. [Language Detection / Auto-Detect](#6-language-detection--auto-detect)
7. [Working Code Examples](#7-working-code-examples)
8. [Changelog Highlights](#8-changelog-highlights)
9. [Our Current Integration Status](#9-our-current-integration-status)
10. [Recommendations for This Project](#10-recommendations-for-this-project)

---

## 1. REST API

### Endpoint

```
POST https://api.sarvam.ai/speech-to-text
```

There is also a legacy translate-specific endpoint (deprecated, use saaras:v3 mode=translate instead):
```
POST https://api.sarvam.ai/speech-to-text-translate
```

### Authentication

Header-based API key:
```
api-subscription-key: YOUR_SARVAM_API_KEY
```

### Content Type

```
Content-Type: multipart/form-data
```

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `file` | binary | **Yes** | -- | Audio file (multipart form field) |
| `model` | string | No | `saarika:v2.5` | Model to use: `saarika:v2.5`, `saaras:v3` |
| `language_code` | string | No | -- | BCP-47 code (e.g., `hi-IN`, `en-IN`). Use `"unknown"` for auto-detect |
| `mode` | string | No | `transcribe` | **saaras:v3 only**: `transcribe`, `translate`, `verbatim`, `translit`, `codemix` |
| `input_audio_codec` | string | No | auto-detect | **Required for PCM**: `pcm_s16le`, `pcm_l16`, `pcm_raw` |
| `with_timestamps` | boolean | No | `false` | Return word-level timestamps |
| `with_diarization` | boolean | No | `false` | Speaker diarization (batch API only) |
| `num_speakers` | integer | No | -- | Expected number of speakers (for diarization) |

### Limits

- **Max duration**: 30 seconds per request (REST API)
- **File size**: Not explicitly documented; 422 error for oversized files
- **Optimal sample rate**: 16kHz (API works best at this rate)
- **PCM files**: Only supported at 16kHz sample rate
- **Multi-channel**: Automatically merged to mono

### Response Format (200 OK)

```json
{
  "request_id": "abc123-...",
  "transcript": "The transcribed text here",
  "timestamps": {
    "words": ["The", "transcribed", "text"],
    "start_time_seconds": [0.0, 0.5, 1.2],
    "end_time_seconds": [0.4, 1.1, 1.8]
  },
  "diarized_transcript": {
    "entries": []
  },
  "language_code": "en-IN",
  "language_probability": 0.95
}
```

### Error Response Format

```json
{
  "error": {
    "request_id": "abc123-...",
    "message": "Human-readable error message",
    "code": "invalid_request_error"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 403 | Forbidden (invalid/missing API key) |
| 422 | Unprocessable Entity (unsupported format, file too large) |
| 429 | Quota Exceeded / Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Overloaded |

### Error Codes (in response body)

`invalid_request_error`, `internal_server_error`, `unprocessable_entity_error`,
`insufficient_quota_error`, `invalid_api_key_error`, `authentication_error`,
`not_found_error`, `rate_limit_exceeded_error`

---

## 2. Streaming (WebSocket) API

### Endpoint URLs

**Speech-to-Text (STT):**
```
wss://api.sarvam.ai/speech-to-text/ws
```

**Speech-to-Text-Translate (STTT) -- LEGACY, use saaras:v3 instead:**
```
wss://api.sarvam.ai/speech-to-text-translate/ws/{api_key}
```

Note: The old STTT endpoint puts the API key in the URL path. The newer STT endpoint uses query params + subprotocol auth.

### Authentication Methods

**Method 1 -- Query params + WebSocket subprotocol (Browser-compatible, RECOMMENDED):**
```javascript
const wsUrl = `wss://api.sarvam.ai/speech-to-text/ws?language-code=${languageCode}&model=${model}`;
const ws = new WebSocket(wsUrl, [`api-subscription-key.${apiKey}`]);
```

The API key is passed as a WebSocket subprotocol string: `api-subscription-key.YOUR_KEY`

**Method 2 -- Custom headers (Node.js / Python only):**
```python
websockets.connect(
    "wss://api.sarvam.ai/speech-to-text/ws?language-code=hi-IN",
    additional_headers={"api-subscription-key": api_key}
)
```

```javascript
// Node.js ws library
const ws = new WebSocket(url, {
  headers: { 'api-subscription-key': apiKey }
});
```

### Connection Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language-code` | string | Yes | BCP-47 code (e.g., `en-IN`, `hi-IN`) or `unknown` |
| `model` | string | No | `saarika:v2.5`, `saaras:v2.5`, `saaras:v3` |
| `mode` | string | No | saaras:v3 only: `transcribe`, `translate`, `verbatim`, `translit`, `codemix` |
| `sample_rate` | integer | No | `8000` or `16000` |
| `input_audio_codec` | string | No | `wav`, `pcm_s16le`, `pcm_l16`, `pcm_raw` |
| `high_vad_sensitivity` | boolean | No | `true` for 0.5s silence threshold (default 1.0s) |
| `vad_signals` | boolean | No | `true` to receive `speech_start`/`speech_end` events |
| `flush_signal` | boolean | No | `true` to enable manual buffer flushing |

### Audio Format Requirements (Streaming ONLY)

**CRITICAL: Streaming API only supports WAV and raw PCM formats.**

- WAV (`audio/wav`)
- PCM raw formats: `pcm_s16le`, `pcm_l16`, `pcm_raw`
- MP3, AAC, OGG, WebM, etc. are **NOT supported** for streaming
- Supported sample rates: 8000 Hz, 16000 Hz
- Channels: Mono (1 channel)
- Bit depth: 16-bit (signed, little-endian for PCM)

### Sending Audio Data (JSON Message)

Audio chunks are sent as JSON with base64-encoded audio data:

```json
{
  "audio": {
    "data": "<base64-encoded-pcm-audio>",
    "sample_rate": 16000,
    "encoding": "audio/wav"
  }
}
```

### Alternative: Raw Binary (Old Protocol)

Our current `lib/sarvam.ts` uses the older protocol with the `speech-to-text-translate/streaming` endpoint:
1. Send a config JSON message first
2. Then send raw binary PCM frames

```json
{
  "config": {
    "language_code": "unknown",
    "sample_rate": 16000,
    "encoding": "pcm16",
    "model": "saarika:v2"
  }
}
```

Then send raw `Buffer` of PCM 16-bit LE audio as binary WebSocket frames.

### Response Message Types

**Transcript data:**
```json
{
  "type": "data",
  "data": {
    "request_id": "abc123",
    "transcript": "hello how are you",
    "language_code": "en-IN",
    "metrics": {
      "audio_duration": 2.5,
      "processing_latency": 0.3
    }
  }
}
```

**VAD signals (when `vad_signals=true`):**
```json
{
  "type": "speech_start"
}
```
```json
{
  "type": "speech_end"
}
```

**Flush signal (manual):**
Send `flush()` via SDK or send a flush message to force immediate processing.

### Silence / VAD Behavior

- `high_vad_sensitivity=false` (default): Requires ~1 second of silence to trigger transcription
- `high_vad_sensitivity=true`: Requires ~0.5 seconds of silence

---

## 3. Supported Audio Formats & MIME Types

### REST API -- Full Format Support

| Format | MIME Types Accepted |
|--------|-------------------|
| MP3 | `audio/mpeg`, `audio/mp3`, `audio/mpeg3`, `audio/x-mpeg-3`, `audio/x-mp3` |
| WAV | `audio/wav`, `audio/x-wav`, `audio/wave` |
| AAC | `audio/aac`, `audio/x-aac` |
| AIFF | `audio/aiff`, `audio/x-aiff` |
| OGG/Opus | `audio/ogg`, `audio/opus` |
| FLAC | `audio/flac`, `audio/x-flac` |
| MP4/M4A | `audio/mp4`, `audio/x-m4a` |
| AMR | `audio/amr` |
| WMA | `audio/x-ms-wma` |
| WebM | `audio/webm` |
| PCM | `pcm_s16le`, `pcm_l16`, `pcm_raw` (requires `input_audio_codec` param) |

### Streaming API -- Limited Format Support

| Format | Supported |
|--------|-----------|
| WAV | Yes |
| PCM (pcm_s16le, pcm_l16, pcm_raw) | Yes |
| Everything else (MP3, WebM, OGG, etc.) | **NO** |

### The webm;codecs=opus Problem

The browser `MediaRecorder` produces blobs with MIME type `audio/webm;codecs=opus`. When this MIME type string is sent to Sarvam:

- **REST API**: The MIME type `audio/webm` is supported, but `audio/webm;codecs=opus` (with the codec suffix) may cause `"Invalid file type"` errors depending on how the server parses the Content-Type.
- **Streaming API**: WebM is NOT supported at all.

**Fix for REST API**: Strip the codec suffix by re-wrapping the blob:
```javascript
const cleanBlob = new Blob([await audio.arrayBuffer()], { type: "audio/webm" });
```
This is exactly what our `app/api/stt/route.ts` already does.

---

## 4. Browser MediaRecorder (webm/opus) -- The Problem & Solutions

### The Problem

Browser `MediaRecorder` API records in `audio/webm;codecs=opus` by default (Chrome/Edge) or `audio/ogg;codecs=opus` (Firefox). Neither format works with the Sarvam Streaming API, and the full MIME string with codecs can cause issues with the REST API.

### Solution A: Use REST API with WebM (simplest, higher latency)

Record chunks with MediaRecorder, send each chunk to the REST endpoint. Strip the codec from the MIME type:

```javascript
// Record 5-second chunks
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});

mediaRecorder.ondataavailable = async (event) => {
  if (event.data.size > 0) {
    // Strip codec suffix -- Sarvam accepts "audio/webm" but not "audio/webm;codecs=opus"
    const cleanBlob = new Blob([event.data], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', cleanBlob, 'chunk.webm');
    formData.append('model', 'saaras:v3');
    formData.append('language_code', 'unknown');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': API_KEY },
      body: formData
    });
    const result = await res.json();
    console.log(result.transcript);
  }
};

mediaRecorder.start(5000); // 5-second chunks
```

**Pros**: Simple, no conversion needed.
**Cons**: High latency (5+ seconds per chunk), not truly real-time.

### Solution B: Use AudioWorklet/ScriptProcessor to capture PCM + WebSocket (real-time)

Capture raw PCM from the browser's AudioContext and send to the WebSocket endpoint. This is what the official Sarvam HTML examples do:

```javascript
// 1. Get microphone stream at 16kHz
const stream = await navigator.mediaDevices.getUserMedia({
  audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
});

// 2. Create AudioContext at 16kHz
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);

// 3. Use ScriptProcessor to get raw Float32 samples
const processor = audioContext.createScriptProcessor(2048, 1, 1);

processor.onaudioprocess = (event) => {
  const float32 = event.inputBuffer.getChannelData(0);

  // Convert Float32 -> Int16 (PCM 16-bit)
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  // Base64 encode
  const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));

  // Send as JSON to WebSocket
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      audio: {
        data: base64,
        encoding: "audio/wav",
        sample_rate: 16000
      }
    }));
  }
};

source.connect(processor);
processor.connect(audioContext.destination);

// 4. Connect WebSocket with subprotocol auth
const ws = new WebSocket(
  `wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saaras:v3`,
  [`api-subscription-key.${apiKey}`]
);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'data') {
    console.log('Transcript:', msg.data.transcript);
  }
};
```

**Pros**: True real-time, low latency (~250ms).
**Cons**: ScriptProcessor is deprecated (use AudioWorklet for production), requires 16kHz AudioContext.

### Solution C: Use AudioWorklet (modern, recommended)

Same approach as B but use AudioWorklet instead of the deprecated ScriptProcessor:

```javascript
// audio-processor.js (AudioWorklet)
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0][0]; // mono channel
    if (input) {
      this.port.postMessage(input);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
```

```javascript
// Main thread
await audioContext.audioWorklet.addModule('audio-processor.js');
const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
source.connect(workletNode);
workletNode.connect(audioContext.destination);

workletNode.port.onmessage = (event) => {
  const float32 = event.data;
  // Convert to Int16 and send to WebSocket (same as Solution B)
};
```

---

## 5. Models: Saarika vs Saaras

### Quick Comparison

| Feature | saarika:v2.5 | saaras:v2.5 | saaras:v3 |
|---------|-------------|-------------|-----------|
| **Status** | Deprecated soon | Deprecated soon | **Current / Recommended** |
| **Primary function** | Transcription only | Translation only | All-in-one (transcribe, translate, etc.) |
| **API endpoint** | `/speech-to-text` | `/speech-to-text-translate` | `/speech-to-text` |
| **Languages** | 11 + auto-detect | 11 + auto-detect | **23 + auto-detect** |
| **Modes** | N/A | N/A | `transcribe`, `translate`, `verbatim`, `translit`, `codemix` |
| **Streaming** | Yes (WebSocket) | Yes (WebSocket) | Yes (WebSocket, native) |
| **WER (IndicVoices)** | ~18.3% | -- | **~19%** (but with 2x language coverage) |
| **8kHz telephony** | Yes | Yes | Yes (optimized) |
| **Code-mixing** | Basic | Basic | **Enhanced** |
| **Diarization** | Batch only | No | Batch only |

### Saarika v2.5 (DEPRECATED SOON)

- Transcribes audio in the spoken language (no translation)
- 11 languages: Hindi, Bengali, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, English, Gujarati
- CER: 4.96% overall on VISTAAR benchmark
- WER: 18.32% overall; English 8.26%, Hindi 11.81%
- **Recommendation**: Migrate to `saaras:v3` with `mode="transcribe"`

### Saaras v3 (CURRENT -- USE THIS)

- State-of-the-art unified model
- 23 languages (22 Indian + English)
- Trained on 1M+ hours of multilingual audio
- Causal attention architecture enables native streaming
- WER: ~19% on IndicVoices (10 languages)
- Optimized for 8kHz telephony audio
- Supports all 5 output modes via `mode` parameter

### Mode Examples (saaras:v3)

Input speech: "mera phone number hai 9840950950" (Hindi-English code-mixed)

| Mode | Output |
|------|--------|
| `transcribe` | mera phone number hai 9840950950 |
| `translate` | My phone number is 9840950950 |
| `verbatim` | mera phone number hai nau aath chaar zero nau paanch zero nau paanch zero |
| `translit` | mera phone number hai 9840950950 |
| `codemix` | mera phone number hai 9840950950 |

### Complete Language Codes (saaras:v3)

| Language | Code |
|----------|------|
| Hindi | `hi-IN` |
| Bengali | `bn-IN` |
| Kannada | `kn-IN` |
| Malayalam | `ml-IN` |
| Marathi | `mr-IN` |
| Odia | `od-IN` |
| Punjabi | `pa-IN` |
| Tamil | `ta-IN` |
| Telugu | `te-IN` |
| Gujarati | `gu-IN` |
| English | `en-IN` |
| Assamese | `as-IN` |
| Urdu | `ur-IN` |
| Nepali | `ne-IN` |
| Konkani | `kok-IN` |
| Kashmiri | `ks-IN` |
| Sindhi | `sd-IN` |
| Sanskrit | `sa-IN` |
| Santali | `sat-IN` |
| Manipuri | `mni-IN` |
| Bodo | `brx-IN` |
| Maithili | `mai-IN` |
| Dogri | `doi-IN` |
| Auto-detect | `unknown` |

---

## 6. Language Detection / Auto-Detect

### How It Works

- Set `language_code` to `"unknown"` (REST) or `language-code=unknown` (WebSocket query param)
- The API auto-detects the spoken language from the supported set
- Response includes:
  - `language_code`: The detected language in BCP-47 format
  - `language_probability`: Confidence score from 0.0 to 1.0

### Best Practices

- Auto-detect works across all supported languages for the chosen model
- saarika:v2.5 auto-detects among 11 languages
- saaras:v3 auto-detects among 23 languages
- For known single-language audio, specifying the language improves accuracy and reduces latency
- For our use case (Indian sales calls with code-mixing), `"unknown"` is appropriate

---

## 7. Working Code Examples

### 7.1 cURL -- REST API (Transcription)

```bash
curl -X POST https://api.sarvam.ai/speech-to-text \
  -H "api-subscription-key: YOUR_SARVAM_API_KEY" \
  -F "file=@audio.wav;type=audio/wav" \
  -F "model=saaras:v3" \
  -F "mode=transcribe" \
  -F "language_code=unknown"
```

### 7.2 cURL -- REST API (Translation to English)

```bash
curl -X POST https://api.sarvam.ai/speech-to-text \
  -H "api-subscription-key: YOUR_SARVAM_API_KEY" \
  -F "file=@hindi_audio.wav;type=audio/wav" \
  -F "model=saaras:v3" \
  -F "mode=translate" \
  -F "language_code=hi-IN"
```

### 7.3 cURL -- REST API with WebM file

```bash
curl -X POST https://api.sarvam.ai/speech-to-text \
  -H "api-subscription-key: YOUR_SARVAM_API_KEY" \
  -F "file=@recording.webm;type=audio/webm" \
  -F "model=saaras:v3" \
  -F "language_code=unknown"
```

### 7.4 Python -- REST API (using SDK)

```python
from sarvamai import SarvamAI

client = SarvamAI(api_subscription_key="YOUR_SARVAM_API_KEY")

response = client.speech_to_text.transcribe(
    file=open("audio.wav", "rb"),
    model="saaras:v3",
    mode="transcribe",
    language_code="unknown"
)

print(response.transcript)
print(response.language_code)
print(response.language_probability)
```

### 7.5 Python -- REST API (using requests)

```python
import requests

url = "https://api.sarvam.ai/speech-to-text"
headers = {"api-subscription-key": "YOUR_SARVAM_API_KEY"}

with open("audio.wav", "rb") as f:
    files = {"file": ("audio.wav", f, "audio/wav")}
    data = {
        "model": "saaras:v3",
        "mode": "transcribe",
        "language_code": "unknown"
    }
    response = requests.post(url, headers=headers, files=files, data=data)

result = response.json()
print(result["transcript"])
```

### 7.6 JavaScript/TypeScript -- REST API (using SDK)

```typescript
import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
  apiSubscriptionKey: "YOUR_SARVAM_API_KEY"
});

const response = await client.speechToText.transcribe({
  file: audioFile,           // File, Blob, or ReadableStream
  model: "saaras:v3",
  mode: "transcribe",
  languageCode: "unknown"
});

console.log(response.transcript);
```

### 7.7 JavaScript/TypeScript -- REST API (using fetch)

```typescript
const formData = new FormData();
formData.append("file", audioBlob, "audio.wav");
formData.append("model", "saaras:v3");
formData.append("mode", "transcribe");
formData.append("language_code", "unknown");

const response = await fetch("https://api.sarvam.ai/speech-to-text", {
  method: "POST",
  headers: {
    "api-subscription-key": "YOUR_SARVAM_API_KEY",
  },
  body: formData,
});

const result = await response.json();
console.log(result.transcript);
// result.language_code, result.language_probability also available
```

### 7.8 Python -- WebSocket Streaming (Official Example)

```python
import asyncio
import base64
import json
import pyaudio
import websockets

async def send_audio_chunks(websocket, chunk_duration_ms=100):
    sample_rate = 16000
    channels = 1
    sample_size = 2  # 16-bit PCM
    chunk_size = int(sample_rate * (chunk_duration_ms / 1000) * channels * sample_size)

    audio_format = pyaudio.paInt16
    stream = pyaudio.PyAudio().open(
        format=audio_format,
        channels=channels,
        rate=sample_rate,
        input=True,
        frames_per_buffer=chunk_size,
    )

    try:
        while True:
            audio_chunk = stream.read(chunk_size)
            encoded_chunk = base64.b64encode(audio_chunk).decode("utf-8")

            audio_message = {
                "audio": {
                    "data": encoded_chunk,
                    "sample_rate": sample_rate,
                    "encoding": "audio/wav",
                }
            }

            await websocket.send(json.dumps(audio_message))
            await asyncio.sleep(chunk_duration_ms / 1000.0)
    except asyncio.CancelledError:
        pass
    finally:
        stream.stop_stream()
        stream.close()

async def receive_messages(websocket):
    try:
        while True:
            response = await websocket.recv()
            msg = json.loads(response)
            if msg.get("type") == "data":
                print(f"Transcript: {msg['data']['transcript']}")
    except websockets.exceptions.ConnectionClosedOK:
        pass

async def main():
    api_key = "YOUR_SARVAM_API_KEY"
    language_code = "hi-IN"
    websocket_url = f"wss://api.sarvam.ai/speech-to-text/ws?language-code={language_code}"

    async with websockets.connect(
        websocket_url,
        additional_headers={"api-subscription-key": api_key}
    ) as websocket:
        send_task = asyncio.create_task(send_audio_chunks(websocket))
        receive_task = asyncio.create_task(receive_messages(websocket))
        await asyncio.gather(send_task, receive_task)

asyncio.run(main())
```

### 7.9 JavaScript (Browser) -- WebSocket Streaming (Official Sarvam Example)

```javascript
// Configuration
const apiKey = "YOUR_SARVAM_API_KEY";
const languageCode = "en-IN";
const model = "saaras:v3";

// Convert Float32 audio samples to Int16 PCM
function float32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

// 1. Get microphone
const stream = await navigator.mediaDevices.getUserMedia({
  audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
});

// 2. Create AudioContext
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(2048, 1, 1);

// 3. Connect WebSocket -- auth via subprotocol
const wsUrl = `wss://api.sarvam.ai/speech-to-text/ws?language-code=${languageCode}&model=${model}`;
const ws = new WebSocket(wsUrl, [`api-subscription-key.${apiKey}`]);

ws.onopen = () => console.log("Connected");

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "data") {
    console.log("Transcript:", msg.data.transcript);
    console.log("Language:", msg.data.language_code);
    console.log("Latency:", msg.data.metrics.processing_latency, "s");
  } else if (msg.type === "speech_start") {
    console.log("Speech detected");
  } else if (msg.type === "speech_end") {
    console.log("Speech ended");
  }
};

// 4. Process audio and send
let audioChunks = new Float32Array(0);
const CHUNK_SIZE = 16000 * 0.5; // 500ms at 16kHz

processor.onaudioprocess = (event) => {
  const inputData = event.inputBuffer.getChannelData(0);

  // Accumulate samples
  const combined = new Float32Array(audioChunks.length + inputData.length);
  combined.set(audioChunks);
  combined.set(inputData, audioChunks.length);
  audioChunks = combined;

  // Send when we have 500ms of audio
  if (audioChunks.length >= CHUNK_SIZE) {
    const int16Data = float32ToInt16(audioChunks);
    audioChunks = new Float32Array(0);

    // Base64 encode the PCM data
    const uint8 = new Uint8Array(int16Data.buffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64Audio = btoa(binary);

    // Send as JSON
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        audio: {
          data: base64Audio,
          encoding: "audio/wav",
          sample_rate: 16000
        }
      }));
    }
  }
};

source.connect(processor);
processor.connect(audioContext.destination);
```

### 7.10 Node.js -- WebSocket Streaming (Server-Side)

```typescript
import WebSocket from 'ws';

const apiKey = process.env.SARVAM_API_KEY;
const wsUrl = 'wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saaras:v3';

const ws = new WebSocket(wsUrl, {
  headers: {
    'api-subscription-key': apiKey,
  },
});

ws.on('open', () => {
  console.log('Connected to Sarvam STT');
});

// Send PCM audio chunk (Buffer of 16-bit LE PCM at 16kHz)
function sendAudioChunk(pcmBuffer: Buffer) {
  const base64 = pcmBuffer.toString('base64');
  ws.send(JSON.stringify({
    audio: {
      data: base64,
      sample_rate: 16000,
      encoding: 'audio/wav',
    },
  }));
}

ws.on('message', (data: Buffer) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'data') {
    console.log('Transcript:', msg.data.transcript);
  }
});

ws.on('error', (err) => console.error('WS Error:', err.message));
ws.on('close', (code, reason) => console.log('Closed:', code, reason.toString()));
```

---

## 8. Changelog Highlights (2025)

| Date | Change |
|------|--------|
| Sep 2025 | Flush signal for WebSocket; 8kHz sample rate support added |
| Aug 2025 | PCM audio formats (`pcm_s16le`, `pcm_l16`, `pcm_raw`) introduced |
| Jul 2025 | VAD start/end events in WebSocket responses |
| Jun 2025 | WebSocket streaming launched; saarika v2.5 & saaras v2.5 released; batch STT alpha; expanded format support (MP3, WAV, AAC, AIFF, OGG/Opus, FLAC, MP4/M4A, AMR) |
| Apr 2025 | Batch ASR API (up to 20 files, 60min each) |
| Feb 2025 | REST API max duration reduced from 8 minutes to 30 seconds |

---

## 9. Our Current Integration Status

### What We Have

**File: `lib/sarvam.ts` -- WebSocket Streaming (Exotel telephony audio)**
- Connects to `wss://api.sarvam.ai/speech-to-text-translate/streaming` (OLD endpoint)
- Uses custom header auth: `api-subscription-key` in ws headers
- Sends config message with `{ config: { language_code, sample_rate, encoding, model } }` (OLD protocol)
- Then sends raw binary PCM 16-bit LE at 16kHz
- Model: `saarika:v2` (OUTDATED)
- Expects response: `{ transcript, is_final }`

**File: `app/api/stt/route.ts` -- REST API (browser audio)**
- Posts to `https://api.sarvam.ai/speech-to-text`
- Sends multipart form: file (audio/webm), model (saarika:v2.5), language_code (unknown)
- Strips `codecs=opus` from MIME type by re-creating the Blob as `audio/webm`
- Model: `saarika:v2.5` (DEPRECATED SOON)

**File: `server.ts` -- WebSocket bridge**
- Receives Exotel audio (PCM 16-bit, 8kHz, base64 JSON)
- Upsamples 8kHz -> 16kHz for Sarvam
- Also receives browser agent audio (PCM 16-bit, 8kHz raw binary)
- Upsamples and forwards to Sarvam streaming

### Issues

1. **Old WebSocket endpoint**: `speech-to-text-translate/streaming` -- should migrate to `speech-to-text/ws`
2. **Old model**: `saarika:v2` -- should upgrade to `saaras:v3`
3. **Old config protocol**: Sends `{ config: {...} }` then raw binary -- new protocol uses JSON `{ audio: { data, sample_rate, encoding } }` with base64 data
4. **Old response format**: Expects `{ transcript, is_final }` -- new format is `{ type: "data", data: { transcript, ... } }`

---

## 10. Recommendations for This Project

### Migration Plan

1. **Update `lib/sarvam.ts`** to use:
   - New endpoint: `wss://api.sarvam.ai/speech-to-text/ws?language-code=unknown&model=saaras:v3`
   - New auth: header `api-subscription-key` (same as before, works with Node.js ws library)
   - New message format: Send `{ audio: { data: base64, sample_rate: 16000, encoding: "audio/wav" } }`
   - New response parsing: Look for `msg.type === "data"` then `msg.data.transcript`
   - Keep the 8kHz->16kHz upsampling in `server.ts` (or use `sample_rate=8000` query param -- Sarvam now supports 8kHz natively since Sep 2025)

2. **Update `app/api/stt/route.ts`** to use:
   - Model: `saaras:v3` (already partially done, uses `saarika:v2.5`)
   - Add `mode: "transcribe"` parameter
   - Keep the webm MIME type stripping fix

3. **Consider removing the REST STT route** entirely if all audio goes through WebSocket streaming (lower latency, better for real-time).

4. **For 8kHz telephony audio**: Can now send directly at 8kHz without upsampling by setting `sample_rate=8000` in the WebSocket query params. This eliminates the `upsample8kTo16k` function in `server.ts`.

### Key Gotchas

- WebM/Opus works with REST API but NOT with Streaming API
- Always strip `codecs=opus` from MIME type when sending webm to REST API
- `saarika:v2.5` is being deprecated -- migrate to `saaras:v3` with `mode="transcribe"`
- The old streaming endpoint (`/speech-to-text-translate/streaming`) may stop working -- use `/speech-to-text/ws`
- For browser WebSocket auth, must use subprotocol: `api-subscription-key.YOUR_KEY`
- For Node.js WebSocket auth, use custom header: `api-subscription-key: YOUR_KEY`

---

## Sources

- https://docs.sarvam.ai/api-reference-docs/speech-to-text/transcribe
- https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/rest-api
- https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/streaming-api
- https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/overview
- https://docs.sarvam.ai/api-reference-docs/getting-started/models/saaras
- https://docs.sarvam.ai/api-reference-docs/getting-started/models/saarika
- https://docs.sarvam.ai/api-reference-docs/changelog
- https://www.sarvam.ai/apis/speech-to-text
- https://www.sarvam.ai/blogs/asr
- https://github.com/sarvamai/sarvam-streaming-apis
- https://github.com/agentvoiceresponse/avr-asr-sarvam
- https://docs.pipecat.ai/server/services/stt/sarvam
- https://www.npmjs.com/package/sarvamai
