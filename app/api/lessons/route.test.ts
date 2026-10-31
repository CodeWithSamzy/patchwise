import { describe, expect, it } from "vitest";

import { GET as getLesson } from "./[slug]/route";
import { GET as listLessons } from "./route";

describe("lesson API", () => {
  it("lists lesson summaries without full source examples", async () => {
    const response = await listLessons();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveLength(3);
    expect(payload[0]).not.toHaveProperty("vulnerable");
    expect(payload[0]).not.toHaveProperty("fixed");
  });

  it("returns a complete lesson by slug", async () => {
    const response = await getLesson(
      new Request("http://localhost/api/lessons/parameterized-queries"),
      { params: Promise.resolve({ slug: "parameterized-queries" }) },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.slug).toBe("parameterized-queries");
    expect(payload.vulnerable).toContain("db.query");
    expect(payload.fixed).toContain("$1");
  });
});
