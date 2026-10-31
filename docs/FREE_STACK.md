# Free technology stack

Patchwise has no required paid dependency.

| Layer | Technology | License or cost |
|---|---|---|
| Web framework | Next.js | MIT |
| Interface | React | MIT |
| Language | TypeScript | Apache-2.0 |
| Validation | Zod | MIT |
| Tests | Vitest | MIT |
| Package manager | npm | Free |
| Source control | Git | GPL-2.0 |
| Repository hosting | Public GitHub repository | Free plan |
| CI | GitHub Actions standard runners for a public repository | Free |
| Security scanning | GitHub CodeQL for a public repository | Free |
| Optional hosting | Cloudflare Workers Free plan | Free within published limits |
| Optional usage analytics | PostHog cookieless analytics | Free within published limits |

## What is intentionally absent

- No paid LLM API. Rule explanations are bundled and deterministic.
- No Redis requirement. Scans are synchronous.
- No paid database requirement. The current store is ephemeral and in memory.
- No authentication provider. The anonymous scanner does not require accounts.
- No required analytics service. PostHog tracking is optional and disabled without environment configuration.
- No purchased domain. A free provider subdomain is enough.

## Zero-cost deployment model

1. Publish the repository as public on GitHub.
2. Let GitHub Actions run the test and build workflow.
3. Deploy the application to Cloudflare Workers using its free workers.dev subdomain.
4. Keep the application stateless unless persistent history becomes a real user requirement.

Cloudflare's free limits are service limits, not an unlimited guarantee. When a limit is reached, requests fail instead of requiring Patchwise to depend on a paid service. The application can always be self-hosted with Node.js.
