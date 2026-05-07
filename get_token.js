require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const { exec } = require('child_process');

const CLIENT_ID     = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOP          = process.env.SHOPIFY_STORE;
const REDIRECT_URI  = 'http://localhost:3456/callback';
const SCOPES        = 'read_products,write_products,read_content,write_content,read_themes,write_themes,read_metafields,write_metafields';
const PORT          = 3456;

if (!CLIENT_ID || !CLIENT_SECRET || !SHOP) {
  console.error('Missing SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, or SHOPIFY_STORE in .env');
  process.exit(1);
}

// Generate a random nonce for CSRF protection
const nonce = crypto.randomBytes(16).toString('hex');

const authUrl =
  `https://${SHOP}/admin/oauth/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&state=${nonce}`;

console.log('\n--- Shopify OAuth Token Generator ---\n');
console.log('Step 1: Opening authorization URL in your browser...');
console.log('\nIf it does not open automatically, paste this URL manually:\n');
console.log(authUrl);
console.log('\nWaiting for Shopify to redirect back...\n');

// Open browser (cross-platform)
const openCmd =
  process.platform === 'win32' ? `start "" "${authUrl}"` :
  process.platform === 'darwin' ? `open "${authUrl}"` :
  `xdg-open "${authUrl}"`;

exec(openCmd, (err) => {
  if (err) console.log('Could not auto-open browser. Please open the URL above manually.');
});

// Step 2: Local server to catch the callback
const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/callback')) return;

  const params = new URL(req.url, `http://localhost:${PORT}`).searchParams;
  const code        = params.get('code');
  const returnedState = params.get('state');
  const errorParam  = params.get('error');

  if (errorParam) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h2>Authorization denied: ${errorParam}</h2><p>You can close this tab.</p>`);
    console.error(`\nAuthorization denied: ${errorParam}`);
    server.close();
    return;
  }

  if (returnedState !== nonce) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h2>State mismatch — possible CSRF attack. Request rejected.</h2>');
    console.error('\nState mismatch. Token exchange aborted.');
    server.close();
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h2>No code received from Shopify.</h2>');
    server.close();
    return;
  }

  console.log('Step 2: Received authorization code from Shopify.');
  console.log('Step 3: Exchanging code for access token...\n');

  // Step 3: Exchange code for access token
  try {
    const tokenRes = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.access_token) {
      throw new Error(JSON.stringify(data));
    }

    const token = data.access_token;

    // Save token to .env
    let envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('SHOPIFY_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/SHOPIFY_ACCESS_TOKEN=.*/, `SHOPIFY_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nSHOPIFY_ACCESS_TOKEN=${token}`;
    }
    fs.writeFileSync('.env', envContent);

    console.log('Access token obtained and saved to .env\n');
    console.log(`SHOPIFY_ACCESS_TOKEN=${token}\n`);
    console.log('You can now close the browser tab and run your SEO scripts.');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h2>Success!</h2>
      <p>Access token saved to <code>.env</code>.</p>
      <p>Token: <code>${token}</code></p>
      <p>You can close this tab.</p>
    `);
  } catch (err) {
    console.error('Token exchange failed:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h2>Token exchange failed</h2><pre>${err.message}</pre>`);
  }

  server.close();
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}/callback`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the process using it and try again.`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});
