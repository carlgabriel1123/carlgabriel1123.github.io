# AI SEO Agent Bot — Shopify & WordPress SEO Optimization System

An agentic AI-driven SEO optimization pipeline built with Claude Code. Automatically audits, plans, and executes multi-phase SEO improvements across Shopify and WordPress stores using the Admin API, GraphQL, and theme file injection — no manual admin UI work required.

---

## How the Agent Works

```
1. AUDIT    → Fetch live HTML, analyze meta tags, schema, titles, headings
2. PLAN     → Score the store, identify gaps, define what each phase fixes
3. EXECUTE  → Run Node.js scripts against the store's API
4. VERIFY   → Re-fetch live pages and confirm changes are active
5. SCORE    → Report before/after SEO score with remaining gaps
```

Each phase is a standalone Node.js script that runs independently.

---

## Token Generation

Tokens expire in ~24 hours and are regenerated on demand.

### curl
```bash
curl -X POST "https://YOUR-STORE.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"CLIENT_ID","client_secret":"CLIENT_SECRET","grant_type":"client_credentials"}'
```

### Node.js
```js
const res = await fetch('https://STORE.myshopify.com/admin/oauth/access_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: process.env.SHOPIFY_CLIENT_ID,
    client_secret: process.env.SHOPIFY_CLIENT_SECRET,
    grant_type: 'client_credentials'
  })
});
const { access_token } = await res.json();
```

### Find myshopify.com subdomain from custom domain
```js
const html = await fetch('https://your-domain.com').then(r => r.text());
const match = html.match(/([a-z0-9-]+\.myshopify\.com)/);
console.log(match[1]);
```

---

## Phase System

### Phase 1 — Collection SEO Titles & Descriptions
- Query all collections, identify null/weak SEO fields
- Write keyword-optimized seo.title + seo.description for each
- Execute via `collectionUpdate` GraphQL mutation

### Phase 2 — Theme-Level SEO (Liquid Templates)
- Fix title tag format, smart meta description fallbacks
- Inject `snippets/seo.liquid`: OG/Twitter tags, canonical, product price meta
- Create `snippets/schema.liquid`: Organization, WebSite, SearchAction JSON-LD
- Inject `{%- render 'schema' -%}` into `layout/theme.liquid`

### Phase 3 — Product, Collection & Page Meta
- All products via `productUpdate` GraphQL mutation
- All collections via `collectionUpdate` mutation
- All pages via `metafieldsSet` (global.title_tag / global.description_tag)

### Phase 4 — Title Fix + BreadcrumbList
- Fix double-brand suffix bug
- Add keyword-rich homepage title
- Add BreadcrumbList JSON-LD to all page types
- Fix og:title to match title tag

### Phase 5 — Alt Texts, Noindex Empty Collections, Richer Descriptions
- Product image alt texts via `productUpdateMedia` mutation
- Noindex zero-product collections via theme.liquid
- Expand product descriptions with H2s, spec tables, keyword sections
- Add ItemList JSON-LD to homepage

### Phase 6 — Blog, Article Schema, Redirects, Org Upgrade
- 301 redirects for duplicate pages
- SEO meta on all blog articles via `metafieldsSet`
- Expand thin articles (600 → 3000+ chars)
- Publish 3–4 new SEO-targeted blog articles
- Add BlogPosting + BreadcrumbList JSON-LD to article pages
- Upgrade Organization schema to ["Organization","Store"] with sameAs links

---

## Score Progression (powerwallstore.com example)

| After Phase | Score | Key Wins |
|-------------|-------|----------|
| Baseline    | 35/100 | — |
| Phase 2     | 52/100 | Canonical, OG/Twitter, schema |
| Phase 3     | 64/100 | 40+ SEO titles/descriptions |
| Phase 4     | 72/100 | Title dedup fix, BreadcrumbList |
| Phase 5     | 79/100 | Alt texts, noindex, richer content |
| Phase 6     | 85/100 | Blog content, Article schema |

---

## Project Structure

```
/
├── README.md
├── get_token.js                     ← Token generator utility
├── run-node.js                      ← Script runner helper
├── package.json
│
├── asiapartsstore/
│   ├── phase1_complete.js           ← Collection SEO batch update
│   ├── phase2_scan_products.js      ← Scan products for SEO gaps
│   ├── phase2_fix_products.js       ← Fix product SEO fields
│   ├── phase3_schema.js             ← Schema injection
│   ├── phase3_verify.js             ← Live verification
│   └── snippets_scheme.liquid.txt   ← Liquid schema snippet
│
├── powerwallstore/
│   ├── phase2_seo_schema.js         ← Theme: seo.liquid + schema.liquid
│   ├── phase3_seo_meta.js           ← Products + collections + pages SEO meta
│   ├── phase4_fixes.js              ← Title fix, BreadcrumbList, OG image
│   ├── phase5_powerwallstore.js     ← Alt texts, noindex, descriptions
│   └── phase6_powerwallstore.js     ← Blog articles, Article schema, redirects
│
└── tinyhomesgroup/
    ├── phase5_rankmath_schema.js    ← Product schema via Rank Math API
    ├── phase5_inject_schema.js      ← Product JSON-LD injection
    └── phase5_product_schema.js     ← AIOSEO product schema
```

---

## Setup

```bash
npm install
```

Run a phase:
```bash
SHOPIFY_TOKEN=shpat_xxx node powerwallstore/phase3_seo_meta.js
```

---

## Key API Patterns

### Update product SEO (GraphQL)
```js
mutation productUpdate($input: ProductInput!) {
  productUpdate(input: $input) {
    product { seo { title description } }
    userErrors { field message }
  }
}
```

### Set page SEO via metafields (GraphQL)
```js
mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { namespace key value }
    userErrors { field message }
  }
}
// ownerId: "gid://shopify/Page/123"
// namespace: "global", key: "title_tag" or "description_tag"
```

### Create redirect (REST)
```js
POST /admin/api/2024-01/redirects.json
{ "redirect": { "path": "/pages/old", "target": "/pages/new" } }
```

### Update theme Liquid file (REST)
```js
PUT /admin/api/2024-01/themes/{theme_id}/assets.json
{ "asset": { "key": "snippets/seo.liquid", "value": "...liquid..." } }
```

### WordPress — Rank Math Product Schema
```js
POST https://site.com/wp-json/rankmath/v1/updateMeta
Authorization: Basic base64(user:app_password)
{
  "objectType": "post", "objectID": 2142,
  "meta": {
    "rank_math_rich_snippet": "product",
    "rank_math_snippet_product_brand": "Brand",
    "rank_math_snippet_product_instock": "on",
    "rank_math_snippet_product_currency": "USD",
    "rank_math_snippet_product_price": "32500"
  }
}
```

---

## Stores Optimized

| Store | Platform | Phases | Final Score |
|-------|----------|--------|-------------|
| asiapartsstore.com | Shopify | 1–3 | ~65/100 |
| powerwallstore.com | Shopify | 2–6 | ~85/100 |
| tinyhomesgroup.com | WordPress + Rank Math | 5 | ~70/100 |

---

## Built By
**Rhey Golena** — Agentic AI Developer | JP Franklin Group
AI SEO Agent powered by **Claude Code** (Anthropic)
Repository maintained by **Carl Gabriel Piramo**
