# Free deployment

Patchwise can run on any Node.js 24 host. The repository also includes an optional Cloudflare Workers configuration so a small public deployment can use the Workers Free plan and a free workers.dev subdomain.

## Before deployment

1. Create a free Cloudflare account.
2. Install dependencies with npm install.
3. Authenticate the open-source Wrangler CLI:

       npx wrangler login

4. Build the Worker locally:

       npm run cf:build

5. Deploy:

       npm run cf:deploy

Wrangler prints the workers.dev URL after a successful deployment.

## Free-plan behavior

Patchwise does not require a database, queue, LLM, object store, purchased domain, or authentication provider. Scan responses are returned directly to the browser.

The GET scan lookup uses best-effort process memory. It is useful during local development but should not be treated as durable history on a serverless deployment. The main scanner does not depend on this lookup.

## Repository URL

After publishing the GitHub repository, set NEXT_PUBLIC_REPOSITORY_URL to its public URL before building. This turns the Open source navigation link into a GitHub link.

## Avoiding unexpected costs

- Stay on the Cloudflare Workers Free plan.
- Do not add paid bindings.
- Use the included workers.dev subdomain.
- Keep the scanner anonymous and stateless.
- Monitor usage in the Cloudflare dashboard.

When a free-plan limit is reached, Cloudflare rejects excess operations. Patchwise does not contain an automatic paid fallback.
