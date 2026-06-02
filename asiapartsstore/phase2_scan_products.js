require('dotenv').config();

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API   = `https://${STORE}/admin/api/2024-01/graphql.json`;
const H     = { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN };

const gql = (query, variables = {}) =>
  fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) })
    .then(r => r.json());

async function scanAllProducts() {
  const missing = [];
  let cursor = null;
  let page = 0;
  let total = 0;

  console.log('Scanning all products for missing SEO...\n');

  while (true) {
    page++;
    const query = `
      query ($cursor: String) {
        products(first: 250, after: $cursor) {
          edges {
            cursor
            node {
              id
              title
              handle
              productType
              vendor
              seo { title description }
            }
          }
          pageInfo { hasNextPage }
        }
      }`;

    const result = await gql(query, { cursor });

    if (result.errors) {
      console.error('GraphQL error:', JSON.stringify(result.errors));
      break;
    }

    const edges = result.data.products.edges;
    total += edges.length;

    const pageMissing = edges
      .map(e => e.node)
      .filter(p => !p.seo.title);

    missing.push(...pageMissing);

    process.stdout.write(`\r  Page ${page} | Scanned: ${total} | Missing SEO: ${missing.length}`);

    if (!result.data.products.pageInfo.hasNextPage) break;
    cursor = edges[edges.length - 1].cursor;

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\nScan complete.`);
  console.log(`Total products: ${total}`);
  console.log(`Missing SEO title: ${missing.length}`);

  if (missing.length > 0) {
    console.log('\nProducts missing SEO:');
    missing.forEach(p => console.log(`  - ${p.title} (${p.handle})`));
  }

  return missing;
}

scanAllProducts().then(missing => {
  if (missing.length === 0) {
    console.log('\nAll products have SEO titles. Phase 2 products task complete.');
  }
});
