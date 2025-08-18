const buckets = new Map<string, { count: number; reset: number }>();
export function allow(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { count: 0, reset: now + windowMs };
  if (now > b.reset) { b.count = 0; b.reset = now + windowMs; }
  b.count++; buckets.set(ip, b);
  return b.count <= limit;
}