import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';

// Reads recent iMessage conversations by shelling out to the system `sqlite3`
// CLI. Turbopack can't bundle node:sqlite, and shipping better-sqlite3 as a
// native dep doesn't add value here — this is local-dev-only anyway.
//
// KNOWN LIMITATION: modern macOS Messages stores rich-text messages with
// emoji/formatting in the `attributedBody` BLOB (a typedstream binary archive)
// and leaves the `text` column NULL. We currently only read the `text`
// column, so we miss roughly 85% of recent messages. To fix: add a typedstream
// parser (https://github.com/dgelessus/python-typedstream is the reference)
// — that's a fair amount of code, deferred. Calendar + Gmail cover most of
// the use case in the meantime.

export interface IMessageRow {
  rowid: number;
  date: string;
  isFromMe: boolean;
  text: string;
  chatName: string | null;
  handle: string | null;
}

const APPLE_EPOCH_OFFSET_SECONDS = 978307200;

export function readRecentMessages(daysBack = 7): IMessageRow[] {
  const dbPath = path.join(homedir(), 'Library', 'Messages', 'chat.db');
  const sinceUnix = Math.floor(Date.now() / 1000) - daysBack * 24 * 60 * 60;
  const sql = `
    SELECT
      m.ROWID AS rowid,
      (m.date / 1000000000 + ${APPLE_EPOCH_OFFSET_SECONDS}) AS date_unix,
      m.is_from_me AS is_from_me,
      m.text AS text,
      c.display_name AS chat_name,
      h.id AS handle
    FROM message m
    LEFT JOIN handle h ON h.ROWID = m.handle_id
    LEFT JOIN chat_message_join cmj ON cmj.message_id = m.ROWID
    LEFT JOIN chat c ON c.ROWID = cmj.chat_id
    WHERE (m.date / 1000000000 + ${APPLE_EPOCH_OFFSET_SECONDS}) > ${sinceUnix}
      AND m.text IS NOT NULL
      AND length(m.text) > 0
    ORDER BY m.date ASC;
  `;
  const out = execFileSync('sqlite3', ['-readonly', '-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!out.trim()) return [];
  const rows = JSON.parse(out) as Array<{
    rowid: number;
    date_unix: number;
    is_from_me: number;
    text: string;
    chat_name: string | null;
    handle: string | null;
  }>;
  return rows.map((r) => ({
    rowid: r.rowid,
    date: new Date(r.date_unix * 1000).toISOString(),
    isFromMe: r.is_from_me === 1,
    text: r.text,
    chatName: r.chat_name,
    handle: r.handle,
  }));
}

export function groupByThread(messages: IMessageRow[]): Map<string, IMessageRow[]> {
  const threads = new Map<string, IMessageRow[]>();
  for (const m of messages) {
    const key = m.chatName ?? m.handle ?? 'unknown';
    const arr = threads.get(key) ?? [];
    arr.push(m);
    threads.set(key, arr);
  }
  return threads;
}
