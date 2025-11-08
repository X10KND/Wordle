export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { db, all } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const rows = await all<any>(
    db().prepare(
      `SELECT id,name,total_guesses,total_time_ms,finished_at FROM players WHERE room_code=?1 ORDER BY (finished_at IS NULL), total_guesses ASC, total_time_ms ASC`
    ).bind(code)
  );
  return NextResponse.json({ players: rows });
}

