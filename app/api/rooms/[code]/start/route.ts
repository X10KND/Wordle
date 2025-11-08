export const runtime = "edge";
import { db, one, nowMs } from "@/lib/db";
import { json, parseCookies } from "@/lib/http";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const pid = parseCookies(req.headers.get("cookie"))?.pid;
  if (!pid) return json({ error: "No player" }, { status: 401 });
  const code = params.code.toUpperCase();
  const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code = ?1`).bind(code));
  if (!room) return json({ error: "Room not found" }, { status: 404 });
  if (room.creator_player_id !== pid) return json({ error: "Only host can start" }, { status: 403 });
  if (room.status !== "lobby") return json({ error: "Already started" }, { status: 400 });

  await db()
    .prepare(`UPDATE rooms SET status='in_progress', started_at=?2 WHERE code=?1`) 
    .bind(code, nowMs())
    .run();
  return json({ ok: true });
}
