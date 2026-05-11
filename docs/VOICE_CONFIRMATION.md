# Voice confirmation for morning roll-call

> **Premise:** Tapping "yes I'll go" is too easy to mindlessly dismiss. Speaking the commitment out loud — and having that audio saved — makes the commitment feel real and is harder to fake later.

## Flow

1. **Morning push (7:00 AM, configurable):** "Roll call — 3 commitments today. Tap to confirm."
2. Tap opens roll-call screen. For each event, big sprite + event title + time + location.
3. User taps a **big orange record button** at bottom. Recording starts; waveform animates.
4. App prompts (text + TTS): *"Are you going to Econ paper at Olin at 4:00 today?"*
5. User speaks: "yes" or "no, I'm not going."
6. Whisper transcribes; Claude parses intent + confidence.
7. Result shown with playback ("you said: 'yes I'm going'") so user knows it heard correctly. One re-record allowed.
8. Audio file uploaded to Vercel Blob (private), URL stored on the event row. Saved permanently — this is the audit trail.

## Why voice (the commitment-device argument)

- **Cognitive load:** speaking aloud requires you to actually picture yourself doing it. Tapping doesn't.
- **Social proof to self:** if you said "yes" and didn't go, you can listen back and confront the lie. Tapping doesn't replay.
- **Lie detection:** Claude can flag low-confidence "yes"es ("uhhh yeah I guess"). Tap can't.
- **Cancellation friction:** to cancel, you also speak it. "I'm not going" out loud is harder than tapping cancel. Helps the $25 fee feel reasonable.

## Implementation

**Mobile:**
- `expo-av` for recording (5 sec max per response)
- Upload to `/api/voice/upload` (multipart)
- Show waveform during recording via `react-native-audio-recorder-player` or hand-rolled

**Server:**
- Receive audio → Vercel Blob private upload
- POST audio to OpenAI Whisper (or Anthropic Claude w/ audio input once that's stable)
- POST transcript to Claude Haiku: `{ intent: 'confirm' | 'cancel' | 'unclear', confidence: 0..1, transcript }`
- If `confirm` and high confidence → event stays pending (geofence applies)
- If `cancel` → invoke `/api/events/cancel` with reason = transcript
- If unclear → return to UI for re-record

**Storage:**
- `events.voice_confirmation_url` (text, nullable)
- `events.voice_confirmation_transcript` (text, nullable)
- `events.voice_confirmation_at` (timestamp)

## Anti-cheat properties

- Audio is saved before user sees the intent classifier's result, so they can't game by speaking until they hit the right intent. (Or: we save *every* attempt, not just the final.)
- Daily roll-call is required — if she doesn't roll-call by 9 AM, all events default to "Keep" silently, AND she gets a $5 "missed roll call" fee. (Forces engagement.)
- Once she speaks "I'm going," that audio file is timestamped and immutable. She can't later say "I never agreed to that."

## What this does NOT solve

- Spoofing her own voice (deepfake) — not worth defending against; cost > benefit for personal use.
- Showing up to the right building but not the right room — geofence radius is 50m, not floor-level. Acceptable for MVP.
