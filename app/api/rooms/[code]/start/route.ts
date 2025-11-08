export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db, one, nowMs } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const pid = req.cookies.get("pid")?.value;
  if (!pid) return NextResponse.json({ error: "No player" }, { status: 401 });
  const code = params.code.toUpperCase();
  const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code = ?1`).bind(code));
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.creator_player_id !== pid)
    return NextResponse.json({ error: "Only host can start" }, { status: 403 });
  if (room.status !== "lobby")
    return NextResponse.json({ error: "Already started" }, { status: 400 });

  await db()
    .prepare(`UPDATE rooms SET status='in_progress', started_at=?2 WHERE code=?1`) 
    .bind(code, nowMs())
    .run();
  return NextResponse.json({ ok: true });
}

