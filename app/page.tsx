"use client";
export const runtime = "nodejs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rounds, setRounds] = useState(5);
  const [busy, setBusy] = useState(false);

  async function createRoom() {
    if (!name.trim()) return alert("Please enter your name");
    setBusy(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rounds }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      router.push(`/room/${data.code}`);
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!name.trim()) return alert("Please enter your name");
    if (!code.trim()) return alert("Please enter a room code");
    setBusy(true);
    try {
      const res = await fetch(`/api/rooms/${code.trim().toUpperCase()}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to join room");
      const data = await res.json();
      router.push(`/room/${data.code}`);
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-col gap-6 items-center">
      <div className="w-full max-w-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            placeholder="Your name"
            className="px-3 py-3 rounded bg-neutral-900 border border-neutral-800 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Room code"
            className="px-3 py-3 rounded bg-neutral-900 border border-neutral-800 outline-none uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={joinRoom}
            disabled={busy || !code}
            className="px-4 py-3 rounded bg-correct disabled:opacity-50"
          >
            Join
          </button>
          <div className="flex-1" />
          <label className="text-sm text-neutral-400">Round length</label>
          <select
            className="px-3 py-3 rounded bg-neutral-900 border border-neutral-800 outline-none"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
          >
            {Array.from({ length: 8 }).map((_, i) => {
              const v = i + 3;
              return (
                <option key={v} value={v}>
                  {v}
                </option>
              );
            })}
          </select>
          <button
            onClick={createRoom}
            disabled={busy}
            className="px-4 py-3 rounded bg-present disabled:opacity-50"
          >
            Create Room
          </button>
        </div>
      </div>
    </main>
  );
}
