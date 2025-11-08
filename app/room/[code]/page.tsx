"use client";
export const runtime = "nodejs";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { Board, LetterState } from "@/components/Board";
import { Keyboard } from "@/components/Keyboard";
import { Sidebar, PlayerSummary } from "@/components/Sidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type State = {
  room: { code: string; status: string; rounds: number; isHost: boolean };
  me: string;
  players: PlayerSummary[];
};

export default function RoomPage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const { data, mutate } = useSWR<State>(`/api/rooms/${code}/state`, fetcher, {
    refreshInterval: 1000,
  });

  const isHost = data?.room.isHost;
  const status = data?.room.status || "lobby";

  const [rows, setRows] = useState<
    { letters: string[]; states: LetterState[] }[]
  >(
    Array.from({ length: 6 }, () => ({
      letters: [],
      states: Array(5).fill("empty"),
    }))
  );
  const [keyStates, setKeyStates] = useState<
    Record<string, "absent" | "present" | "correct">
  >({});
  const [lock, setLock] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lock || status !== "in_progress") return;
      const k = e.key;
      if (/^[a-zA-Z]$/.test(k)) onKey(k.toUpperCase());
      else if (k === "Backspace") onKey("DEL");
      else if (k === "Enter") onKey("ENTER");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lock, status, rows]);

  async function startGame() {
    await fetch(`/api/rooms/${code}/start`, { method: "POST" });
    mutate();
  }

  async function onKey(k: string) {
    if (lock) return;
    const current = [...rows];
    const rowIndex = current.findIndex((r) => r.letters.length < 5);
    const idx = rowIndex === -1 ? 5 : rowIndex;
    const r = current[rowIndex === -1 ? 5 : rowIndex];
    if (k === "DEL") {
      const targetRow =
        current.find((rr) => rr.letters.length > 0 && rr.letters.length < 6) ||
        current.find((rr) => rr.letters.length === 5) ||
        current[0];
      const t = targetRow;
      t.letters = t.letters.slice(0, -1);
      setRows([...current]);
      return;
    }
    if (k === "ENTER") {
      const target = current.find((rr) => rr.letters.length === 5);
      if (!target) return;
      setLock(true);
      try {
        const guess = target.letters.join("");
        const res = await fetch(`/api/rooms/${code}/guess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guess }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Guess failed");
        } else {
          const marks = data.marks as ("absent" | "present" | "correct")[];
          const newRows = [...rows];
          const i = newRows.findIndex(
            (rr) => rr.letters.length === 5 && rr.states[0] === "empty"
          );
          const rowi = i === -1 ? 0 : i;
          newRows[rowi] = {
            letters: [...target.letters],
            states: marks as any,
          };
          setRows(newRows);
          const newKeys = { ...keyStates };
          target.letters.forEach((ch, i) => {
            const m = marks[i] as "absent" | "present" | "correct";
            const prev = newKeys[ch];
            if (m === "correct") {
              newKeys[ch] = "correct";
            } else if (m === "present") {
              if (prev !== "correct") newKeys[ch] = "present";
            } else {
              if (!prev) newKeys[ch] = "absent";
            }
          });
          setKeyStates(newKeys);
          // prepare next input row
          if (marks.every((m: any) => m === "correct")) {
            setRows(
              Array.from({ length: 6 }, () => ({
                letters: [],
                states: Array(5).fill("empty"),
              }))
            );
          }
          mutate();
        }
      } finally {
        setLock(false);
      }
      return;
    }
    if (/^[A-Z]$/.test(k)) {
      const target = current.find((rr) => rr.letters.length < 5) || current[0];
      if (target.letters.length < 5) {
        target.letters = [...target.letters, k];
        setRows([...current]);
      }
    }
  }

  const leaderboard = useMemo(() => {
    return [...(data?.players || [])].sort((a, b) => {
      const af = a.finished ? 0 : 1;
      const bf = b.finished ? 0 : 1;
      if (af !== bf) return af - bf;
      if (a.totalGuesses !== b.totalGuesses)
        return a.totalGuesses - b.totalGuesses;
      return a.totalTimeMs - b.totalTimeMs;
    });
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-neutral-400 text-sm">Room</div>
          <div className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 font-mono">
            {code}
          </div>
          {isHost && status === "lobby" && (
            <button
              className="px-3 py-1 rounded bg-correct"
              onClick={startGame}
            >
              Start
            </button>
          )}
          {isHost && status === "finished" && (
            <form action={`/api/rooms/${code}/restart`} method="post">
              <button className="px-3 py-1 rounded bg-present" type="submit">
                New Match
              </button>
            </form>
          )}
        </div>
        {status === "lobby" && (
          <div className="text-neutral-400">Waiting for host to start…</div>
        )}
        {status === "in_progress" && (
          <>
            <Board rows={rows} />
            <div className="h-4" />
            <Keyboard onKey={onKey} keyStates={keyStates} />
          </>
        )}
        {status === "finished" && (
          <div className="w-full max-w-lg">
            <h3 className="font-semibold text-neutral-300 mb-2">Results</h3>
            <div className="bg-neutral-900 border border-neutral-800 rounded p-2 text-sm">
              {leaderboard.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  <div className="w-6 text-neutral-500">{i + 1}.</div>
                  <div className="flex-1">{p.name}</div>
                  <div className="w-24 text-right">
                    {p.totalGuesses} guesses
                  </div>
                  <div className="w-28 text-right">
                    {Math.round(p.totalTimeMs / 1000)}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Sidebar players={data?.players || []} />
    </div>
  );
}
