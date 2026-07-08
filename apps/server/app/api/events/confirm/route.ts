import { getDb, schema } from '@class-on-time/db';
import { cancellationFeeCents } from '@class-on-time/shared';
import { requireUser, unauthorized } from '@/lib/session';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

// Voice-based confirmation. The mobile app does on-device speech-to-text
// (expo-speech-recognition) and posts the transcript here. Claude Haiku
// classifies intent — confirm vs cancel vs unclear — so a sarcastic
// "uhhhh yeah I guess" doesn't pass as a real commitment.

const body = z.object({
  eventId: z.string().uuid(),
  transcript: z.string().min(1).max(1000),
  audioUrl: z.string().url().optional(),
});

let cachedAnthropic: Anthropic | undefined;
function anthropic() {
  if (cachedAnthropic) return cachedAnthropic;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  cachedAnthropic = new Anthropic({ apiKey: key });
  return cachedAnthropic;
}

interface IntentResult {
  intent: 'confirm' | 'cancel' | 'unclear';
  confidence: number; // 0..1
  reason: string;
}

async function classifyIntent(transcript: string, title: string): Promise<IntentResult> {
  const res = await anthropic().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `You classify whether a user is confirming or cancelling a commitment.

The commitment they were asked about is the event title shown to you.

Return strict JSON:
{ "intent": "confirm" | "cancel" | "unclear", "confidence": 0..1, "reason": "<one short sentence>" }

Examples:
- "yes I'm going" → confirm, 0.95
- "yeah definitely" → confirm, 0.9
- "uhhhh I guess so" → unclear, 0.4 (hedging)
- "no I'm not going" → cancel, 0.95
- "I don't think I'll make it" → cancel, 0.8
- "maybe" → unclear, 0.3
- "yes but I might leave early" → confirm, 0.8 (still attending)

If the user is sarcastic or hedging, prefer "unclear" so the app prompts again.`,
    messages: [
      {
        role: 'user',
        content: `Commitment: ${JSON.stringify(title)}\nUser said: ${JSON.stringify(transcript)}\n\nReturn JSON only.`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') {
    return { intent: 'unclear', confidence: 0, reason: 'no response' };
  }
  const text = block.text.trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1) return { intent: 'unclear', confidence: 0, reason: 'no json' };
  try {
    return JSON.parse(text.slice(start, end + 1)) as IntentResult;
  } catch {
    return { intent: 'unclear', confidence: 0, reason: 'json parse failed' };
  }
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return unauthorized();

  const json = await req.json().catch(() => null);
  const parsed = body.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const db = getDb();
  const eventRow = await db
    .select()
    .from(schema.events)
    .where(and(eq(schema.events.id, parsed.data.eventId), eq(schema.events.userId, user.id)))
    .limit(1);
  const event = eventRow[0];
  if (!event) return Response.json({ error: 'event not found' }, { status: 404 });

  const intent = await classifyIntent(parsed.data.transcript, event.title);

  if (intent.intent === 'unclear') {
    return Response.json({ ok: false, reason: 'unclear', intent });
  }

  if (intent.intent === 'cancel') {
    const now = new Date();
    const fee = cancellationFeeCents(now.getTime(), event.requiredArrivalAt.getTime());
    await db
      .update(schema.events)
      .set({
        status: 'cancelled',
        cancelledAt: now,
        cancellationFeeCents: fee,
        cancellationReason: parsed.data.transcript,
        rollCallSeenAt: now,
      })
      .where(eq(schema.events.id, event.id));
    return Response.json({ ok: true, action: 'cancelled', feeCents: fee, intent });
  }

  // confirm
  await db
    .update(schema.events)
    .set({ rollCallSeenAt: new Date() })
    .where(eq(schema.events.id, event.id));
  return Response.json({ ok: true, action: 'confirmed', intent });
}
