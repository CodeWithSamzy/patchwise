import { describe, expect, it } from "vitest";

import { securityRules } from "./rules";

const fixtures = [
  {
    id: "sql-injection",
    vulnerable: 'db.query("SELECT * FROM users WHERE id = " + req.query.id)',
    fixed: 'db.query("SELECT * FROM users WHERE id = $1", [req.query.id])',
  },
  {
    id: "cross-site-scripting",
    vulnerable: "output.innerHTML = userInput",
    fixed: "output.textContent = userInput",
  },
  {
    id: "command-injection",
    vulnerable: 'exec("identify " + req.body.filename)',
    fixed: 'execFile("identify", [req.body.filename])',
  },
  {
    id: "path-traversal",
    vulnerable: 'path.join("./uploads", req.params.filename)',
    fixed: 'path.join("./uploads", path.basename(req.params.filename))',
  },
  {
    id: "hardcoded-secret",
    vulnerable: 'const API_KEY = "sk_live_example_secret"',
    fixed: "const API_KEY = process.env.API_KEY",
  },
  {
    id: "weak-hash",
    vulnerable: 'createHash("md5").update(value)',
    fixed: 'createHash("sha256").update(value)',
  },
  {
    id: "jwt-algorithm",
    vulnerable: "jwt.verify(token, secret)",
    fixed: 'jwt.verify(token, secret, { algorithms: ["HS256"] })',
  },
  {
    id: "open-redirect",
    vulnerable: "res.redirect(req.query.next)",
    fixed:
      'res.redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/")',
  },
  {
    id: "permissive-cors",
    vulnerable: "app.use(cors())",
    fixed: 'app.use(cors({ origin: "https://app.example.com" }))',
  },
] as const;

describe.each(fixtures)("$id rule fixtures", (fixture) => {
  const rule = securityRules.find((item) => item.id === fixture.id);

  it("flags the vulnerable fixture", () => {
    expect(rule).toBeDefined();
    expect(rule?.detect(fixture.vulnerable).length).toBeGreaterThan(0);
  });

  it("does not flag the fixed fixture", () => {
    expect(rule?.detect(fixture.fixed)).toHaveLength(0);
  });

  it("only returns an automatic patch that passes its own rule", () => {
    if (!rule?.fix) return;

    const proposed = rule.fix(fixture.vulnerable);
    expect(proposed).not.toBeNull();
    expect(rule.detect(proposed ?? fixture.vulnerable)).toHaveLength(0);
  });
});
