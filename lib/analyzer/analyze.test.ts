import { describe, expect, it } from "vitest";

import { analyzeSource } from "./analyze";
import { apiSample, browserSample, nodeSample } from "../samples";

function ruleIds(source: string) {
  return analyzeSource(source, "javascript", "test-scan").findings.map(
    (finding) => finding.ruleId,
  );
}

describe("analyzeSource", () => {
  it("finds the vulnerable patterns in the bundled API sample", () => {
    const result = analyzeSource(apiSample, "typescript", "api-sample");

    expect(result.summary.total).toBe(4);
    expect(result.summary.critical).toBe(1);
    expect(result.findings.map((finding) => finding.ruleId)).toEqual([
      "sql-injection",
      "hardcoded-secret",
      "permissive-cors",
      "open-redirect",
    ]);
  });

  it("finds DOM XSS", () => {
    expect(ruleIds(browserSample)).toContain("cross-site-scripting");
  });

  it("finds command injection and path traversal", () => {
    const ids = ruleIds(nodeSample);
    expect(ids).toContain("command-injection");
    expect(ids).toContain("path-traversal");
  });

  it.each([
    ['createHash("md5").update(value)', "weak-hash"],
    ["jwt.verify(token, secret)", "jwt-algorithm"],
    ['res.redirect(req.query.next)', "open-redirect"],
    ['app.use(cors({ origin: "*" }))', "permissive-cors"],
    ['const AUTH_TOKEN = "a-real-looking-secret";', "hardcoded-secret"],
  ])("detects %s as %s", (source, ruleId) => {
    expect(ruleIds(source)).toContain(ruleId);
  });

  it("re-scans every proposed patch before returning it", () => {
    const result = analyzeSource(
      [
        'const API_KEY = "sk_live_example_value";',
        'element.innerHTML = userInput;',
        'db.query("SELECT * FROM users WHERE id = " + req.query.id);',
        'res.redirect(req.query.next);',
        "app.use(cors());",
      ].join("\n"),
      "javascript",
      "fix-test",
    );

    expect(result.findings.length).toBe(5);
    for (const finding of result.findings) {
      expect(finding.fix?.verified).toBe(true);
      expect(finding.fix?.code).not.toBe("");
    }
  });

  it("does not flag parameterized queries and safe DOM text", () => {
    const source = [
      'db.query("SELECT * FROM users WHERE id = $1", [req.query.id]);',
      "element.textContent = userInput;",
      'execFile("identify", [filename]);',
      'app.use(cors({ origin: "https://app.example.com" }));',
    ].join("\n");

    const result = analyzeSource(source, "javascript", "safe-test");
    expect(result.findings).toHaveLength(0);
    expect(result.summary.score).toBe(100);
  });
});
