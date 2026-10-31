export type Lesson = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  difficulty: "Beginner" | "Intermediate";
  minutes: number;
  cwe: string;
  vulnerable: string;
  fixed: string;
  takeaways: string[];
};

export const lessons: Lesson[] = [
  {
    slug: "parameterized-queries",
    number: "01",
    title: "Stop SQL injection",
    summary:
      "Learn why escaping is not the same as separating code from data.",
    difficulty: "Beginner",
    minutes: 6,
    cwe: "CWE-89",
    vulnerable:
      'app.get("/user", async (req, res) => {\n  const user = await db.query(\n    "SELECT * FROM users WHERE id = " + req.query.id\n  );\n  res.json(user);\n});',
    fixed:
      'app.get("/user", async (req, res) => {\n  const user = await db.query(\n    "SELECT * FROM users WHERE id = $1",\n    [req.query.id]\n  );\n  res.json(user);\n});',
    takeaways: [
      "Placeholders keep query structure constant.",
      "The driver handles the value as data.",
      "Validation still matters for type and business rules.",
    ],
  },
  {
    slug: "safe-dom-updates",
    number: "02",
    title: "Render text, not scripts",
    summary:
      "See how a single DOM property can turn ordinary input into executable markup.",
    difficulty: "Beginner",
    minutes: 5,
    cwe: "CWE-79",
    vulnerable:
      'const greeting = document.querySelector("#greeting");\ngreeting.innerHTML = location.hash.slice(1);',
    fixed:
      'const greeting = document.querySelector("#greeting");\ngreeting.textContent = location.hash.slice(1);',
    takeaways: [
      "Use textContent when the value is text.",
      "Treat sanitization as an allowlist problem.",
      "CSP is useful defense in depth, not the primary fix.",
    ],
  },
  {
    slug: "safe-process-execution",
    number: "03",
    title: "Avoid the shell",
    summary:
      "Replace interpolated shell commands with explicit executables and argument arrays.",
    difficulty: "Intermediate",
    minutes: 8,
    cwe: "CWE-78",
    vulnerable:
      'const { exec } = require("node:child_process");\nexec("identify " + req.body.filename);',
    fixed:
      'const { execFile } = require("node:child_process");\nexecFile("identify", [req.body.filename]);',
    takeaways: [
      "Shell metacharacters matter only when a shell parses them.",
      "Argument arrays preserve value boundaries.",
      "Use least privilege for worker processes as a second layer.",
    ],
  },
];

export function getLesson(slug: string): Lesson | null {
  return lessons.find((lesson) => lesson.slug === slug) ?? null;
}
