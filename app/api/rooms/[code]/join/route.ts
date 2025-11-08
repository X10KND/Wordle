export const runtime = "edge";
import { db, one, nowMs } from "@/lib/db";
import { cookieSerialize, json } from "@/lib/http";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const code = params.code.toUpperCase();
    if (!name) return json({ error: "Name required" }, { status: 400 });

    const room = await one<any>(db().prepare(`SELECT * FROM rooms WHERE code = ?1`).bind(code));
    if (!room) return json({ error: "Room not found" }, { status: 404 });
    if (room.status !== "lobby")
      return json({ error: "Game already started" }, { status: 400 });

    const playerId = crypto.randomUUID();
    await db()
      .prepare(`INSERT INTO players (id, room_code, name, is_creator, joined_at) VALUES (?1, ?2, ?3, 0, ?4)`) 
      .bind(playerId, code, name, nowMs())
      .run();

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      cookieSerialize("pid", playerId, { httpOnly: true, sameSite: "lax", path: "/" })
    );
    return json({ code }, { headers });
  } catch (e) {
    return json({ error: "Join failed" }, { status: 500 });
  }
}
