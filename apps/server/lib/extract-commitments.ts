import Anthropic from '@anthropic-ai/sdk';

// Given a conversation thread (iMessage or email), pull out the meeting
// commitments the user has agreed to. We deliberately exclude vague plans
// like "we should hang out sometime" — only commitments with a concrete
// time and location.

let cached: Anthropic | undefined;
function client(): Anthropic {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export interface ConversationLine {
  who: string;
  when: string; // ISO
  text: string;
}

export interface ExtractedCommitment {
  withWho: string;
  startsAt: string; // ISO datetime
  endsAt: string; // ISO datetime
  location: string | null;
  title: string;
  confidence: 'high' | 'medium' | 'low';
  evidenceQuote: string;
}

const SYSTEM = `You are reading a conversation between Naomi (a Wesleyan University student in Middletown CT) and someone else. Extract any **concrete meeting commitments** Naomi made.

A commitment requires ALL of:
1. A specific time (today, tomorrow, or a named day with hour resolution — not "sometime next week")
2. Either a specific location OR an activity that implies one (lunch → restaurant, gym → Freeman, study → library)
3. Naomi appeared to agree (didn't decline or stay non-committal)

Exclude:
- Vague plans ("we should hang out sometime")
- Other people's plans Naomi didn't agree to
- Past events that have already happened
- Commitments she declined

Use today's date for resolving relative times ("tomorrow", "Tuesday"). Resolve to the closest future occurrence. Assume Eastern Time.

Common Wesleyan locations:
- Olin / Olin Library
- Usdan / Usdan Center
- Freeman Athletic Center / gym
- Exley Science Center
- Main Street (downtown Middletown)
- PAC / Public Affairs Center

Return strict JSON only:
{
  "commitments": [
    {
      "withWho": "<other party name or contact>",
      "startsAt": "<ISO 8601 datetime with timezone>",
      "endsAt": "<ISO 8601 datetime with timezone>",
      "location": "<location string or null>",
      "title": "<short event title>",
      "confidence": "high" | "medium" | "low",
      "evidenceQuote": "<short verbatim quote from the conversation>"
    }
  ]
}

If no commitments, return {"commitments": []}.`;

export async function extractCommitments(
  thread: ConversationLine[],
  contextLabel: string,
): Promise<ExtractedCommitment[]> {
  if (thread.length === 0) return [];

  const transcript = thread
    .map((l) => `[${l.when}] ${l.who}: ${l.text.replace(/\n/g, ' ').slice(0, 500)}`)
    .join('\n');

  const today = new Date().toISOString();
  const res = await client().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Today is ${today}. Conversation context: ${contextLabel}.\n\n${transcript}\n\nExtract Naomi's commitments. Return JSON only.`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return [];
  const text = block.text.trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return [];
  try {
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
      commitments: ExtractedCommitment[];
    };
    return parsed.commitments ?? [];
  } catch {
    return [];
  }
}
