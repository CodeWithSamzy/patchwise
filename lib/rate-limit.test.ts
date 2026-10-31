import { describe, expect, it } from "vitest";

import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows 30 scans per minute and rejects the next request", () => {
    const client = "test-client-" + crypto.randomUUID();

    for (let request = 0; request < 30; request += 1) {
      expect(checkRateLimit(client).allowed).toBe(true);
    }

    const rejected = checkRateLimit(client);
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
  });
});
