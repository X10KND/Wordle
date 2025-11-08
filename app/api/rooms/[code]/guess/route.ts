export const runtime = "edge";
import { db, one, nowMs } from "@/lib/db";
import { evaluateGuess } from "@/lib/game";
import { json, parseCookies } from "@/lib/http";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const pid = parseCookies(req.headers.get("cookie"))?.pid;
  if (!pid) return json({ error: "No player" }, { status: 401 });
  const code = params.code.toUpperCase();
  const body = await req.json();
  const guessRaw = String(body.guess || "").toUpperCase();
  if (!/^[A-Z]{5}$/.test(guessRaw)) return json({ error: "Guess must be 5 letters" }, { status: 400 });

  const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code=?1`).bind(code));
  if (!room) return json({ error: "Room not found" }, { status: 404 });
  if (room.status !== "in_progress") return json({ error: "Not in game" }, { status: 400 });

  // Determine current round for this player
  const latestCompleted = await one<any>(
    db()
      .prepare(
        `SELECT round_index FROM guesses WHERE room_code=?1 AND player_id=?2 GROUP BY round_index HAVING SUM(CASE WHEN result='["correct","correct","correct","correct","correct"]' THEN 1 ELSE 0 END) > 0 ORDER BY round_index DESC LIMIT 1`
      )
      .bind(code, pid)
  );
  const currentIndex = latestCompleted ? Number(latestCompleted.round_index) + 1 : 0;
  if (currentIndex >= Number(room.rounds_count)) {
    return NextResponse.json({ error: "Game already finished for you" }, { status: 400 });
  }

  const round = await one<any>(
    db().prepare(`SELECT word FROM rounds WHERE room_code=?1 AND round_index=?2`).bind(code, currentIndex)
  );
  if (!round) return json({ error: "Round not found" }, { status: 404 });

  const marks = evaluateGuess(String(round.word), guessRaw);
  await db()
    .prepare(
      `INSERT INTO guesses (room_code, player_id, round_index, guess, result, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
    .bind(code, pid, currentIndex, guessRaw, JSON.stringify(marks), nowMs())
    .run();

  // If finished this guess, check if player finished the game to set totals
  const correct = marks.every((m) => m === "correct");
  if (correct) {
    const countRow = await one<any>(
      db().prepare(`SELECT COUNT(*) as c FROM guesses WHERE room_code=?1 AND player_id=?2`).bind(code, pid)
    );
    const totalGuesses = Number(countRow?.c || 0);
    // If last round
    if (currentIndex + 1 >= Number(room.rounds_count)) {
      const totalTime = nowMs() - Number(room.started_at || nowMs());
      await db()
        .prepare(`UPDATE players SET total_guesses=?3,total_time_ms=?4,finished_at=?5 WHERE id=?1 AND room_code=?2`)
        .bind(pid, code, totalGuesses, totalTime, nowMs())
        .run();
    } else {
      await db()
        .prepare(`UPDATE players SET total_guesses=?3 WHERE id=?1 AND room_code=?2`)
        .bind(pid, code, totalGuesses)
        .run();
    }
  }

  return json({ ok: true, marks });
}
