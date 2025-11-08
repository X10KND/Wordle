"use client";
import React from "react";

const ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","DEL"],
];

export function Keyboard({
  onKey,
  keyStates,
}: {
  onKey: (key: string) => void;
  keyStates: Record<string, "absent" | "present" | "correct" | undefined>;
}) {
  return (
    <div className="select-none">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center mb-1">
          {row.map((k) => {
            const state = keyStates[k];
            return (
              <button
                key={k}
                className={`keyboard-key ${state ? state : ""} ${k.length > 1 ? "px-4" : "w-10"}`}
                onClick={() => onKey(k)}
              >
                {k}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

