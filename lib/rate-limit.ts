type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __patchwiseRateLimits: Map<string, RateLimitEntry> | undefined;
}

const requests = globalThis.__patchwiseRateLimits ?? new Map<string, RateLimitEntry>();
globalThis.__patchwiseRateLimits = requests;

const windowMs = 60_000;
const requestLimit = 30;
const maxTrackedClients = 5_000;

export function checkRateLimit(key: string) {
  const now = Date.now();

  if (requests.size >= maxTrackedClients && !requests.has(key)) {
    for (const [client, entry] of requests.entries()) {
      if (entry.resetAt <= now) requests.delete(client);
    }
    if (requests.size >= maxTrackedClients) {
      const oldestClient = requests.keys().next().value;
      if (oldestClient) requests.delete(oldestClient);
    }
  }

  const current = requests.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    requests.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: requestLimit - 1, resetAt };
  }

  current.count += 1;
  return {
    allowed: current.count <= requestLimit,
    remaining: Math.max(0, requestLimit - current.count),
    resetAt: current.resetAt,
  };
}
