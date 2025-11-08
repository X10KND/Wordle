export const runtime = "edge";
import { db, all, one } from "@/lib/db";
import { squaresFromMarks } from "@/lib/game";
import { json, parseCookies } from "@/lib/http";

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const pid = parseCookies(req.headers.get("cookie"))?.pid || "";
  const code = params.code.toUpperCase();
  const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code=?1`).bind(code));
  if (!room) return json({ error: "Room not found" }, { status: 404 });

  const players = await all<any>(db().prepare(`SELECT * FROM players WHERE room_code=?1 ORDER BY joined_at ASC`).bind(code));
  const rounds = await all<any>(db().prepare(`SELECT round_index FROM rounds WHERE room_code=?1 ORDER BY round_index`).bind(code));

  const guesses = await all<any>(
    db().prepare(
      `SELECT player_id, round_index, result FROM guesses WHERE room_code=?1 ORDER BY created_at ASC`
    ).bind(code)
  );

  const byPlayer: Record<string, { roundIndex: number; squares: string[]; totalGuesses: number }> = {};
  players.forEach((p: any) => (byPlayer[p.id] = { roundIndex: 0, squares: [], totalGuesses: 0 }));
  for (const g of guesses) {
    const res: ("absent" | "present" | "correct")[] = JSON.parse(g.result);
    const sq = squaresFromMarks(res);
    const p = byPlayer[g.player_id];
    if (!p) continue;
    p.totalGuesses++;
    if (res.every((m) => m === "correct")) {
      p.squares[g.round_index] = sq;
      p.roundIndex = Math.max(p.roundIndex, g.round_index + 1);
    } else {
      p.squares[g.round_index] = sq;
    }
  }

  // If everyone finished, mark room finished once
  const allFinished = players.length > 0 && players.every((p: any) => !!p.finished_at);
  if (room.status === 'in_progress' && allFinished) {
    await db().prepare(`UPDATE rooms SET status='finished' WHERE code=?1`).bind(code).run();
    room.status = 'finished';
  }

  return json({
    room: {
      code: room.code,
      status: room.status,
      rounds: room.rounds_count,
      started_at: room.started_at ?? null,
      isHost: room.creator_player_id === pid,
    },
    me: pid,
    players: players.map((p: any) => ({
      id: p.id,
      name: p.name,
      isCreator: !!p.is_creator,
      roundIndex: byPlayer[p.id]?.roundIndex || 0,
      squares: (byPlayer[p.id]?.squares || []).filter(Boolean),
      totalGuesses: byPlayer[p.id]?.totalGuesses || 0,
      totalTimeMs: p.total_time_ms || 0,
      finished: !!p.finished_at,
    })),
  });
}
