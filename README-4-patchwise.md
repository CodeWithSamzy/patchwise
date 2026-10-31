# Patchwise

> Historical product brief used to start the project. See README.md for the
> current implementation, verified commands, free stack, and deployment guide.

> Paste your code. Patchwise finds the security problems, explains each one in
> plain language, shows how it could be abused, and proposes a fix that it
> re-checks before showing you.

[![CI](https://github.com/<YOUR_USERNAME>/patchwise/actions/workflows/ci.yml/badge.svg)](https://github.com/<YOUR_USERNAME>/patchwise/actions)

**Live demo:** <LIVE_DEMO_URL>
**2-minute walkthrough:** <VIDEO_URL>

> The name and every `<placeholder>` are yours to replace before publishing.
> In the Status section, tick only what is actually done.

## The problem

Most beginner developers never learn why their code is unsafe. Scanners print
cryptic warnings, and tutorials rarely connect a warning to the real mistake.

## What it does

- **Scans pasted code** for common vulnerabilities, starting with JavaScript and TypeScript.
- **Explains each finding** in plain language: what is wrong, why it matters, and how to fix it.
- **Shows the attack idea safely** using harmless example payloads against the code you pasted.
- **Proposes a fix and verifies it:** the fixed code is scanned again, and a fix is shown only if the finding is gone.
- **Maps findings to CWE and OWASP Top 10**, so learners can look them up.
- **Lessons mode:** short lessons built on bundled vulnerable and fixed examples.

## Scope and safety

Patchwise is **static analysis on code you paste**. It does not scan websites,
send requests to third-party systems, or run submitted code. Example attack
payloads are strings shown for learning, not traffic sent anywhere.

## Demo

<!-- Add a GIF: paste a vulnerable login handler, see findings, see the verified fix. -->

## How it works

1. Code is submitted and checked for size and language.
2. A **static analysis worker** runs the bundled rule set against it (deterministic results).
3. Secrets in the snippet are redacted before anything is sent to an LLM.
4. The LLM **explains** each finding and drafts a fix, but it does not decide what counts as a vulnerability. The rules do.
5. The drafted fix is scanned again. If the original finding persists, the fix is discarded or retried.

## Architecture

```
Browser (Next.js)
   │
   ▼
API ──▶ Job queue ──▶ Analysis worker (isolated container, no network)
   │                      │  runs static rules, returns findings
   │                      ▼
   │                 Redaction ──▶ LLM (explanation + fix draft)
   │                                     │
   │◀──────── verified findings ◀── re-scan of the fixed code
   ▼
Postgres (scan history, lessons, user progress)
```

## Key technical decisions

| Decision | Why | Tradeoff |
|---|---|---|
| Rules decide what is vulnerable. The LLM only explains. | Models invent findings and miss real ones. Rules are repeatable. | Coverage is limited to the rules written |
| Fixes are re-scanned before being shown | Prevents "fixes" that do nothing or introduce new bugs | Slower, and some fixes get rejected |
| Analysis runs in a locked-down container with no network and time and memory limits | Submitted code is untrusted input | More infrastructure |
| Submitted code is never executed | Removes the biggest risk class for a code-scanning tool | Cannot find runtime-only issues |
| Secrets redacted before LLM calls | Pasted code may contain real keys | Redaction can occasionally hide useful context |
| Code is not stored unless the user opts in | Privacy | No scan history by default |

## Initial rule coverage

SQL injection (string-built queries), cross-site scripting (unsafe HTML sinks),
command injection, path traversal, hardcoded secrets, weak password hashing,
insecure JWT handling, open redirects, and overly permissive CORS.
<!-- Update this list to match the rules you actually ship. -->

## Tech stack

Next.js, TypeScript, Node.js, a static analysis engine (for example Semgrep
with your own rules in `rules/`), BullMQ, Redis, Postgres, Prisma, Zod, Vitest,
Playwright, GitHub Actions, Docker.

## API (summary)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/scans` | Submit code, returns a scan id |
| GET | `/api/scans/:id` | Status and findings |
| GET | `/api/lessons` | List lessons |
| GET | `/api/lessons/:slug` | One lesson with vulnerable and fixed examples |

Full OpenAPI spec: `docs/openapi.yaml` <!-- generate and link -->

## Testing

```bash
npm test            # unit tests and rule fixture tests
npm run test:e2e    # Playwright flows
```

- **Rule fixtures:** each rule has a `vulnerable` file that must be flagged and
  a `fixed` file that must not. This guards against both missed bugs and false alarms.
- **Fix verification tests** confirm a bad fix is rejected.
- **Redaction tests** confirm secrets never reach the LLM client (mocked in CI).
- Track the false positive and false negative counts across fixtures here once you measure them: <FIXTURE_RESULTS>.

## CI/CD

Lint, type-check, tests, and a secret scan (`gitleaks`) run on every pull
request. Merging to `main` deploys to <HOSTING_PROVIDER>.

## Security of the tool itself

- Input size limits and per-user rate limits.
- Worker sandbox: no network, read-only filesystem, CPU and memory caps, hard timeout.
- No execution of submitted code.
- Output from the LLM is rendered as text, never as HTML.

## Run it locally

```bash
git clone https://github.com/<YOUR_USERNAME>/patchwise.git
cd patchwise
cp .env.example .env
docker compose up        # app, Postgres, Redis, analysis worker
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `REDIS_URL` | Queue |
| `LLM_API_KEY` | Key for the explanation model |
| `AUTH_SECRET` | Session secret |

## Known limitations

- Only JavaScript and TypeScript in the first version.
- Static analysis cannot see business-logic flaws such as missing authorization checks.
- Explanations are generated and should be treated as learning aids, not audits.

## Roadmap

- [ ] Python support
- [ ] Dependency vulnerability checks
- [ ] GitHub pull request integration
- [ ] Progress tracking across lessons

## Status

- [ ] Rule engine with fixtures
- [ ] Explanations and verified fixes
- [ ] Sandboxed worker
- [ ] Lessons mode
- [ ] Tests passing in CI
- [ ] Deployed with a live demo link

## License

MIT
