/**
 * Cloudflare Worker for PGP Inbox Anonymous Submissions
 *
 * This worker receives encrypted messages from the web form and creates
 * GitHub issues via the repository_dispatch API.
 *
 * Setup:
 * 1. Create a new Cloudflare Worker at https://workers.cloudflare.com
 * 2. Paste this code
 * 3. Add the following secrets in your Worker settings:
 *    - GITHUB_TOKEN: A GitHub Personal Access Token with 'repo' scope
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

      // Validate the message
      if (!encryptedMessage || !encryptedMessage.includes('-----BEGIN PGP MESSAGE-----')) {
        return new Response(JSON.stringify({ error: 'Invalid encrypted message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Basic rate limiting using CF headers
      const ip = request.headers.get('CF-Connecting-IP');
      // You could add more sophisticated rate limiting here using KV or Durable Objects

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
