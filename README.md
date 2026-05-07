# SEO Work — Shopify SEO Optimization Scripts

Node.js scripts for Shopify SEO optimization targeting `asiapartsstore.com`. Covers product scanning, schema markup injection, and token authentication.

## Scripts

| Script | Description |
|--------|-------------|
| `phase1_complete.js` | Phase 1: Initial SEO audit and fixes |
| `phase2_scan_products.js` | Scan all products for SEO issues |
| `phase2_fix_products.js` | Apply SEO fixes to products |
| `phase3_schema.js` | Inject structured data / JSON-LD schema |
| `phase3_verify.js` | Verify schema markup is correct |
| `get_token.js` | Shopify Admin API token helper |
| `snippets_scheme.liquid.txt` | Liquid snippet for schema injection |

## Setup

```bash
npm install
cp .env.example .env   # Add Shopify Admin API token and store URL
node phase1_complete.js
```

## Environment Variables

```
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_token
```

---

Built by [Rhey Golena](https://github.com/rtgolenatechva-prog) — Agentic AI Developer | JP Franklin Group
