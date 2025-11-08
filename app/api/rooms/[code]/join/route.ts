export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db, one, nowMs } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const code = params.code.toUpperCase();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code = ?1`).bind(code));
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.status !== "lobby")
      return NextResponse.json({ error: "Game already started" }, { status: 400 });

    const playerId = crypto.randomUUID();
    await db()
      .prepare(`INSERT INTO players (id, room_code, name, is_creator, joined_at) VALUES (?1, ?2, ?3, 0, ?4)`) 
      .bind(playerId, code, name, nowMs())
      .run();

    const res = NextResponse.json({ code });
    res.cookies.set("pid", playerId, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
}

