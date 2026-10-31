# Contributing to Patchwise

Patchwise welcomes bug fixes, rules, lessons, accessibility improvements, documentation, and translations.

## Local setup

1. Fork and clone the repository.
2. Install Node.js 24 and run npm install.
3. Start the app with npm run dev.
4. Before opening a pull request, run:

       npm run typecheck
       npm test
       npm run build

## Adding or changing a security rule

Rules live in lib/analyzer/rules.ts. Every rule must:

- detect a narrowly defined unsafe pattern;
- explain the trust-boundary failure in plain language;
- include a harmless attack example;
- identify its CWE and OWASP category;
- avoid executing or importing submitted code;
- include vulnerable and fixed test fixtures;
- return an automatic fix only when the rule can re-scan and verify it.

Prefer a missed finding over a noisy rule that teaches the wrong lesson. Document known gaps in the rule metadata or pull request.

## Adding a lesson

Add lesson content to lib/lessons.ts. Examples must be small, self-contained, and free of real credentials or copied proprietary code.

## Pull requests

Keep pull requests focused. Explain behavior changes, include tests, and update documentation. Maintainers may ask for smaller follow-up changes when a pull request combines unrelated work.

By contributing, you agree that your contribution is licensed under the repository's MIT license.
