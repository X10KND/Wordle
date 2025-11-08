export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db, one, nowMs } from "@/lib/db";
import { randomWords } from "@/lib/words";

function codegen() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O to avoid confusion
  return Array.from({ length: 4 })
    .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const rounds = Math.max(3, Math.min(10, Number(body.rounds || 5)));
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const code = codegen();
    const playerId = crypto.randomUUID();
    const createdAt = nowMs();

    await db().batch([
      db().prepare(
        `INSERT INTO rooms (code, creator_player_id, rounds_count, status, created_at) VALUES (?1, ?2, ?3, 'lobby', ?4)`
      ).bind(code, playerId, rounds, createdAt),
      db().prepare(
        `INSERT INTO players (id, room_code, name, is_creator, joined_at) VALUES (?1, ?2, ?3, 1, ?4)`
      ).bind(playerId, code, name, createdAt),
    ]);

    const words = randomWords(rounds);
    const inserts = words.map((w, i) =>
      db().prepare(`INSERT INTO rounds (room_code, round_index, word) VALUES (?1, ?2, ?3)`).bind(
        code,
        i,
        w
      )
    );
    await db().batch(inserts);

    const res = NextResponse.json({ code });
    res.cookies.set("pid", playerId, { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

