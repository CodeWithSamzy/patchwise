# Patchwise

<p align="center">
  <img src="./public/patchwise-wordmark.svg" alt="Patchwise" width="330">
</p>

[![CI](https://github.com/CodeWithSamzy/patchwise/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeWithSamzy/patchwise/actions/workflows/ci.yml)
[![CodeQL](https://github.com/CodeWithSamzy/patchwise/actions/workflows/codeql.yml/badge.svg)](https://github.com/CodeWithSamzy/patchwise/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-1f6b4f.svg)](LICENSE)

Patchwise is an interactive JavaScript and TypeScript security scanner built for learning. Paste code, review deterministic findings, understand how each issue can be abused, and apply a fix that Patchwise re-scans before presenting as verified.

## What works today

- Nine static-analysis rules: SQL injection, cross-site scripting, command injection, path traversal, hardcoded secrets, weak hashing, unsafe JWT verification, open redirects, and permissive CORS.
- Plain-language explanations, safe attack examples, CWE references, and OWASP Top 10 mappings.
- Rule-specific fixes shown only after the triggering rule no longer matches.
- Three complete lesson pages with vulnerable examples, safer versions, takeaways, and an embedded scanner.
- In-memory scan lookup with a 30-minute TTL and no durable database storage.
- Responsive scanner interface with JavaScript and TypeScript samples.
- Request validation, security headers, input limits, and scan rate limiting.
- Public-repository CI, CodeQL configuration, Dependabot, rule fixtures, and API integration tests.

Patchwise analyzes text only. It never executes submitted code or sends it to an external model.

## Zero-cost stack

The application has no required paid service:

| Need | Choice |
|---|---|
| Application | Next.js, React, TypeScript |
| Validation | Zod |
| Testing | Vitest |
| Source hosting | Public GitHub repository |
| CI and security analysis | GitHub Actions and CodeQL for public repositories |
| Optional public hosting | Cloudflare Workers Free plan |
| AI or LLM | None required |
| Database, Redis, queue, authentication | None required |

All required source dependencies use open-source licenses. See docs/FREE_STACK.md for the detailed breakdown.

## Run locally

    npm ci
    npm run dev

Open http://localhost:3000.

## Verify the project

    npm run check
    npm audit

## API

| Route | Purpose |
|---|---|
| POST /api/scans | Analyze submitted code |
| GET /api/scans/:id | Read a non-expired scan |
| GET /api/lessons | List lessons |
| GET /api/lessons/:slug | Read one lesson |
| GET /api/health | Service health check |

Example scan request:

    curl -X POST http://localhost:3000/api/scans \
      -H "Content-Type: application/json" \
      -d '{"language":"javascript","source":"element.innerHTML = userInput;"}'

Requests are limited to 50,000 characters. Supported language values are "javascript" and "typescript".

## Project structure

    app/                       Next.js pages and API routes
    components/                Scanner UI and icons
    lib/analyzer/              Rule engine, rule metadata, and tests
    lib/lessons.ts             Bundled learning content
    lib/scan-store.ts          Expiring in-memory result store
    lib/samples.ts             Scanner playground examples

## Architecture

    Browser
      |
      v
    Next.js scan API
      |
      +--> validates language and size
      +--> runs deterministic rules
      +--> creates rule-specific fix
      +--> re-scans fixed source
      +--> returns only verified fixes

The MVP intentionally keeps scans synchronous and ephemeral. A production deployment can replace the in-memory store with Postgres and move analysis into isolated queue workers without changing the response model.

The browser receives the completed scan directly from the POST request, so the core product does not depend on durable storage. A self-hosted deployment may add an open-source database later without changing the scanner.

## Free deployment

The included OpenNext and Wrangler configuration deploys the application to Cloudflare Workers:

    npm run cf:build
    npm run cf:deploy

Cloudflare authentication is required, but a paid plan, custom domain, database, or paid API is not. See docs/DEPLOYMENT.md for the complete setup.

## Open-source development

- CONTRIBUTING.md explains rule and lesson contributions.
- SECURITY.md describes private vulnerability reporting.
- CODE_OF_CONDUCT.md defines community expectations.
- ROADMAP.md tracks project direction.
- GitHub issue and pull-request templates are included.

After publishing the repository, set NEXT_PUBLIC_REPOSITORY_URL to its public GitHub URL so the interface links to it.

## Known limitations

- The current detectors are intentionally focused and do not replace a full security audit.
- Static analysis cannot establish authorization correctness or other business-logic properties.
- Automatic fixes cover recognized syntax patterns; unmatched variants still receive manual remediation guidance.
- The scan store is local to one application process and is cleared on restart.

## License

MIT
