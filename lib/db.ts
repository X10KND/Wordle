import { getRequestContext } from "@cloudflare/next-on-pages";

export function db() {
  const env = getRequestContext().env as any;
  return env.WORDLE_DB as any;
}

export async function one<T = any>(stmt: D1PreparedStatement): Promise<T | null> {
  const res = await stmt.first<T>();
  return (res as any) ?? null;
}

export async function all<T = any>(stmt: D1PreparedStatement): Promise<T[]> {
  const res = await stmt.all<T>();
  return (res.results as any) ?? [];
}

export function nowMs() {
  return Date.now();
}
