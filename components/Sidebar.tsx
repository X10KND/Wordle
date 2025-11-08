"use client";
import React from "react";

export type PlayerSummary = {
  id: string;
  name: string;
  isCreator: boolean;
  roundIndex: number;
  squares: string[]; // emoji style squares per round joined by newline
  finished: boolean;
  totalGuesses: number;
  totalTimeMs: number;
};

export function Sidebar({ players }: { players: PlayerSummary[] }) {
  return (
    <aside className="w-full md:w-72 border border-neutral-800 rounded p-3 max-h-[70vh] overflow-y-auto scroll-thin">
      <h3 className="font-semibold text-neutral-300 mb-2">Players</h3>
      <div className="flex flex-col gap-3">
        {players.map((p) => (
          <div key={p.id} className="bg-neutral-900 rounded p-2 border border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{p.name}</span>
              {p.isCreator && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-300">host</span>
              )}
              {p.finished && (
                <span className="ml-auto text-[10px] px-1 py-0.5 rounded bg-correct">done</span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Round {p.roundIndex + 1}</div>
            {p.squares.length > 0 && (
              <pre className="text-xs text-neutral-300 whitespace-pre leading-4 mt-1">{p.squares.join("\n\n")}</pre>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

