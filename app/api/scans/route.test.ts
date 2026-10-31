import { describe, expect, it } from "vitest";

import { GET } from "./[id]/route";
import { POST } from "./route";

describe("scan API", () => {
  it("rejects an empty source", async () => {
    const response = await POST(
      new Request("http://localhost/api/scans", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "empty-source-test",
        },
        body: JSON.stringify({ source: "", language: "javascript" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Paste some code before starting a scan.",
    });
  });

  it("creates and retrieves a scan", async () => {
    const response = await POST(
      new Request("http://localhost/api/scans", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "create-scan-test",
        },
        body: JSON.stringify({
          source: "element.innerHTML = userInput",
          language: "javascript",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const created = await response.json();
    expect(created.findings[0].ruleId).toBe("cross-site-scripting");

    const retrieved = await GET(
      new Request("http://localhost/api/scans/" + created.id),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(retrieved.status).toBe(200);
    await expect(retrieved.json()).resolves.toMatchObject({
      id: created.id,
      status: "complete",
    });
  });

  it("returns 404 for an unknown scan", async () => {
    const response = await GET(
      new Request("http://localhost/api/scans/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(response.status).toBe(404);
  });
});
