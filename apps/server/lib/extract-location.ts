import Anthropic from '@anthropic-ai/sdk';

// Many Google Calendar events have no `location` field set — the user types
// the location into the title or description ("Econ 333 Paper (Olin Date)",
// "PCE Project (Main Street Study Date)"). We send batches to Claude Haiku
// to extract a short, geocodable location string from each.

let cached: Anthropic | undefined;
function client(): Anthropic {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export interface InputEvent {
  sourceEventId: string;
  title: string;
  description: string | null;
}

export interface ExtractedLocation {
  sourceEventId: string;
  location: string | null;
  confidence: 'high' | 'medium' | 'low';
  isClassroomEvent: boolean;
}

const SYSTEM = `You extract physical locations from short calendar event entries.

The user is a Wesleyan University student in Middletown, CT. Many of her events name a Wesleyan location in parentheses inside the title, e.g. "Econ 333 Paper (Olin Date)" → location "Olin Library, Wesleyan University, Middletown CT".

Common shorthand → real place:
- "Olin" / "Olin Library" → "Olin Library, Wesleyan University, Middletown CT"
- "Usdan" → "Usdan University Center, Wesleyan University, Middletown CT"
- "Main Street" / "Main St" → "Main Street, Middletown CT"
- "Exley" → "Exley Science Center, Wesleyan University, Middletown CT"
- "PAC" → "Public Affairs Center, Wesleyan University, Middletown CT"
- "Fayerweather" → "Fayerweather, Wesleyan University, Middletown CT"
- "Foss" / "Foss Hill" → "Foss Hill, Wesleyan University, Middletown CT"
- "Freeman" / "Freeman Athletic Center" → "Freeman Athletic Center, Wesleyan University, Middletown CT"
- Just "gym" alone → assume "Freeman Athletic Center, Wesleyan University, Middletown CT"

If a title is purely a task with no physical location (e.g., "Pray with Isa", "Do Laundry", "Econ 349 Paper" with no parens), return location: null.

Return strict JSON only:
{
  "results": [
    {
      "sourceEventId": "<id>",
      "location": "<full geocodable string> | null",
      "confidence": "high" | "medium" | "low",
      "isClassroomEvent": <boolean>
    }
  ]
}

isClassroomEvent: true if it's a class, lecture, exam, advising meeting; false for study sessions, gym, social meetups, personal tasks.`;

export async function extractLocations(events: InputEvent[]): Promise<ExtractedLocation[]> {
  if (events.length === 0) return [];

  const prompt = events
    .map(
      (e) =>
        `- id: ${e.sourceEventId}\n  title: ${JSON.stringify(e.title)}\n  description: ${JSON.stringify(e.description?.slice(0, 200) ?? '')}`,
    )
    .join('\n');

  const res = await client().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Extract locations from these events. Return JSON only.\n\n${prompt}`,
      },
    ],
  });

  const block = res.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return [];
  const text = block.text.trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return [];
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
    results: ExtractedLocation[];
  };
  return parsed.results ?? [];
}
