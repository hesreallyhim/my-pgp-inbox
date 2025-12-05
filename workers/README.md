# Cloudflare Worker Setup

This documents the Cloudflare Worker that enables anonymous submissions for users without GitHub accounts.

## Architecture

```
User submits encrypted message
        ↓
Turnstile widget validates (client-side)
        ↓
POST to pgp-inbox.hesreallyhim.com/submit
        ↓
Worker validates Turnstile token (server-side)
        ↓
Worker calls GitHub repository_dispatch API
        ↓
GitHub Action creates issue with encrypted message
```

## Components

### 1. Cloudflare Worker (`pgp-inbox-worker.js`)

- **URL**: `https://pgp-inbox.hesreallyhim.com/submit`
- **Alternative URL**: `https://pgp-inbox.hesreallyhim.workers.dev/submit`

The worker:
1. Handles CORS preflight requests
2. Validates the Turnstile token with Cloudflare's siteverify API
3. Validates the encrypted message format
4. Triggers a GitHub repository_dispatch event

### 2. Cloudflare Turnstile

Turnstile is Cloudflare's CAPTCHA alternative that protects against bot abuse.

- **Site Key**: Public, embedded in `docs/encrypt/index.html`
- **Secret Key**: Stored as worker secret `TURNSTILE_SECRET_KEY`
- **Allowed Hostnames**: `hesreallyhim.github.io`

### 3. GitHub Action (`.github/workflows/create-anonymous-issue.yml`)

Triggered by `repository_dispatch` events with type `anonymous_message`. Creates an issue with the encrypted message.

## Worker Secrets

Set these in Cloudflare Dashboard → Workers → pgp-inbox → Settings → Variables:

| Secret Name | Description |
|-------------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token with `Contents: Read and write` permission on this repo |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key from Cloudflare Dashboard → Turnstile |

## Custom Domain Setup

The worker uses a custom domain `pgp-inbox.hesreallyhim.com`:

1. In Cloudflare Workers Dashboard → your worker → Settings → Domains & Routes
2. Add as **Custom Domain** (not Route): `pgp-inbox.hesreallyhim.com`
3. Cloudflare automatically creates the DNS record

## Updating the Worker

1. Go to Cloudflare Dashboard → Workers → pgp-inbox
2. Click "Edit code"
3. Paste contents of `pgp-inbox-worker.js`
4. Click "Deploy"

Or use Wrangler CLI:
```bash
npm install -g wrangler
wrangler login
wrangler deploy workers/pgp-inbox-worker.js --name pgp-inbox
```

## Testing

Test the worker endpoint:
```bash
# Should return "Verification failed" (expected with fake token)
curl -X POST https://pgp-inbox.hesreallyhim.com/submit \
  -H "Content-Type: application/json" \
  -d '{"encrypted_message": "test", "turnstile_token": "test"}'
```

## Troubleshooting

### "Anonymous submission not available"
- Check if the worker URL is reachable
- Verify the custom domain is set up correctly (Custom Domain, not Route)
- Check browser console for CORS errors

### "Verification failed"
- Turnstile token validation failed
- Check that `TURNSTILE_SECRET_KEY` is set correctly in worker secrets
- Verify the hostname is in Turnstile's allowed hostnames list

### GitHub Action not running
- Check that `GITHUB_TOKEN` is set in worker secrets
- Verify the token has `Contents: Read and write` permission
- Check GitHub Actions tab for failed runs

## Future Improvements

- [ ] Migrate from PAT to GitHub App for better security/scoping
- [ ] Add rate limiting using Cloudflare KV or Durable Objects
- [ ] Add logging/monitoring for abuse detection
