export const runtime = "edge";
import { db, one, nowMs } from "@/lib/db";
import { randomWords } from "@/lib/words";
import { json, parseCookies } from "@/lib/http";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const pid = parseCookies(req.headers.get("cookie"))?.pid;
  if (!pid) return json({ error: "No player" }, { status: 401 });
  const code = params.code.toUpperCase();
  const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code = ?1`).bind(code));
  if (!room) return json({ error: "Room not found" }, { status: 404 });
  if (room.creator_player_id !== pid) return json({ error: "Only host can restart" }, { status: 403 });

  // Reset room
  await db().batch([
    db().prepare(`DELETE FROM rounds WHERE room_code=?1`).bind(code),
    db().prepare(`DELETE FROM guesses WHERE room_code=?1`).bind(code),
    db().prepare(`UPDATE players SET total_guesses=0,total_time_ms=0,finished_at=NULL WHERE room_code=?1`).bind(code),
    db().prepare(`UPDATE rooms SET status='lobby', started_at=NULL WHERE code=?1`).bind(code),
  ]);

  const words = randomWords(room.rounds_count);
  const inserts = words.map((w: string, i: number) =>
    db().prepare(`INSERT INTO rounds (room_code, round_index, word) VALUES (?1, ?2, ?3)`).bind(code, i, w)
  );
  await db().batch(inserts);

  return json({ ok: true });
}
