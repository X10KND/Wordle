"use client";
import React from "react";

export type LetterState = "empty" | "absent" | "present" | "correct";

export function Board({
  rows,
  cols = 5,
}: {
  rows: { letters: string[]; states: LetterState[] }[];
  cols?: number;
}) {
  return (
    <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${rows.length}, 3.5rem)` }}>
      {rows.map((row, r) => (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 3.5rem)` }} key={r}>
          {Array.from({ length: cols }).map((_, c) => {
            const ch = row.letters[c] || "";
            const state = row.states[c] || (ch ? "empty" : "empty");
            return (
              <div key={c} className={`tile ${state !== "empty" ? state : ""}`}>{ch}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

