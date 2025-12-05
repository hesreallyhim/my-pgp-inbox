/**
 * Cloudflare Worker for PGP Inbox Anonymous Submissions
 *
 * This worker receives encrypted messages from the web form and creates
 * GitHub issues via the repository_dispatch API.
 *
 * Setup:
 * 1. Create a new Cloudflare Worker at https://workers.cloudflare.com
 * 2. Paste this code (or connect GitHub to the Worker)
 * 3. Add the following secrets in your Worker settings:
 *    - GITHUB_TOKEN: A GitHub Personal Access Token with 'repo' scope
 *    - TURNSTILE_SECRET_KEY: Your Cloudflare Turnstile secret key
 * 4. Update the REPO_OWNER and REPO_NAME constants below
 * 5. Deploy and update SUBMIT_WEBHOOK_URL in index.html
 */

const REPO_OWNER = 'hesreallyhim';
const REPO_NAME = 'my-pgp-inbox';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Verify Turnstile token with Cloudflare
 * @param {string} token - The Turnstile token from the client
 * @param {string} secretKey - The Turnstile secret key
 * @param {string} ip - The client IP address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifyTurnstile(token, secretKey, ip) {
  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (ip) {
    formData.append('remoteip', ip);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const result = await response.json();

  if (result.success) {
    return { success: true };
  } else {
    return {
      success: false,
      error: result['error-codes']?.join(', ') || 'Verification failed',
    };
  }
}

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests to /submit
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/submit') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const body = await request.json();
      const encryptedMessage = body.encrypted_message;
      const turnstileToken = body.turnstile_token;

      // Validate the Turnstile token first
      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: 'Verification token required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const ip = request.headers.get('CF-Connecting-IP');
      const turnstileResult = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);

      if (!turnstileResult.success) {
        console.error('Turnstile verification failed:', turnstileResult.error);
        return new Response(JSON.stringify({ error: 'Verification failed. Please try again.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate the message
      if (!encryptedMessage || !encryptedMessage.includes('-----BEGIN PGP MESSAGE-----')) {
        return new Response(JSON.stringify({ error: 'Invalid encrypted message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Trigger the GitHub workflow via repository_dispatch
      const githubResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'PGP-Inbox-Worker',
          },
          body: JSON.stringify({
            event_type: 'anonymous_message',
            client_payload: {
              encrypted_message: encryptedMessage,
            },
          }),
        }
      );

      if (githubResponse.status === 204) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Message submitted! An issue will be created shortly.'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const errorText = await githubResponse.text();
        console.error('GitHub API error:', githubResponse.status, errorText);
        return new Response(JSON.stringify({
          error: 'Failed to submit message. Please try again later.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
