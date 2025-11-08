export type Mark = "absent" | "present" | "correct";

export function evaluateGuess(answer: string, guess: string): Mark[] {
  const a = answer.toUpperCase();
  const g = guess.toUpperCase();
  const marks: Mark[] = Array(5).fill("absent");
  const counts: Record<string, number> = {};

  for (let i = 0; i < 5; i++) {
    if (a[i] === g[i]) {
      marks[i] = "correct";
    } else {
      counts[a[i]] = (counts[a[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === "correct") continue;
    const ch = g[i];
    if (counts[ch] > 0) {
      marks[i] = "present";
      counts[ch]--;
    }
  }
  return marks;
}

export function squaresFromMarks(marks: Mark[]): string {
  return marks
    .map((m) => (m === "correct" ? "🟩" : m === "present" ? "🟨" : "⬛"))
    .join("");
}

