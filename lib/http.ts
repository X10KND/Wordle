export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(/;\s*/).forEach((part) => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const k = decodeURIComponent(part.slice(0, idx).trim());
      const v = decodeURIComponent(part.slice(idx + 1).trim());
      out[k] = v;
    }
  });
  return out;
}

export function json(data: any, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function cookieSerialize(
  name: string,
  value: string,
  opts: { httpOnly?: boolean; sameSite?: "lax" | "strict" | "none"; path?: string } = {}
): string {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite.charAt(0).toUpperCase()}${opts.sameSite.slice(1)}`);
  return parts.join("; ");
}

