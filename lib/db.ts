import { getRequestContext } from "@cloudflare/next-on-pages";

export function db() {
  const env = getRequestContext().env as any;
  return env.WORDLE_DB as any;
}

// Loosen types to avoid requiring @cloudflare/workers-types in Next.js TS config
export async function one<T = any>(stmt: any): Promise<T | null> {
  const res = await stmt.first();
  return (res as T) ?? null;
}

export async function all<T = any>(stmt: any): Promise<T[]> {
  const res = await stmt.all();
  return (res?.results as T[]) ?? [];
}

export function nowMs() {
  return Date.now();
}
