require('dotenv').config();

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API   = `https://${STORE}/admin/api/2024-01/graphql.json`;
const H     = { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN };

const gql = (query, variables = {}) =>
  fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ query, variables }) })
    .then(r => r.json());

// ── SEO generation ─────────────────────────────────────────────────────────────

function generateSeo(title, productType, vendor) {
  const t = title.toLowerCase();

  // SEO title: keep under 60 chars with brand
  const seoTitle = title.length <= 52
    ? `${title} | Asia Parts Store`
    : `${title.substring(0, 52).trim()}... | Asia Parts Store`;

  // Description: intent-aware template from title keywords
  let desc = '';

  if (t.includes('oil filter')) {
    desc = `Shop ${title}. Genuine and OEM-spec oil filters for reliable engine protection. Fast delivery across Australia and New Zealand.`;
  } else if (t.includes('clutch kit') || t.includes('clutch')) {
    desc = `Buy ${title}. OE replacement and performance clutch kits for smooth, reliable gear changes. Fast AU/NZ shipping.`;
  } else if (t.includes('brake rotor') || t.includes('disc rotor') || t.includes('brake kit')) {
    desc = `Shop ${title}. Quality brake rotors and pads for improved stopping power. OEM-spec and performance options with fast Australia-wide delivery.`;
  } else if (t.includes('brake pad')) {
    desc = `Buy ${title}. Performance and OE replacement brake pads for all makes and models. Fast shipping across Australia and New Zealand.`;
  } else if (t.includes('suspension') || t.includes('shock') || t.includes('strut') || t.includes('coilover')) {
    desc = `Shop ${title}. Quality suspension components for improved handling and ride quality. Fast delivery to Australia and New Zealand.`;
  } else if (t.includes('gasket')) {
    desc = `Buy ${title}. OEM-spec and performance gaskets for a leak-free seal. Compatible with Japanese and imported vehicles. Fast AU/NZ delivery.`;
  } else if (t.includes('exhaust') || t.includes('muffler') || t.includes('downpipe')) {
    desc = `Shop ${title}. Performance exhaust components for improved flow and sound. Fast shipping across Australia and New Zealand.`;
  } else if (t.includes('camshaft') || t.includes('piston') || t.includes('bearing') || t.includes('valve spring')) {
    desc = `Buy ${title}. Quality engine internals for performance builds and OE replacement. Fast delivery across Australia and New Zealand.`;
  } else if (t.includes('headlight') || t.includes('taillight') || t.includes('light') || t.includes('led')) {
    desc = `Shop ${title}. Quality automotive lighting for improved visibility and style. Fast shipping to Australia and New Zealand.`;
  } else if (t.includes('wheel') || t.includes('rim') || t.includes('tyre') || t.includes('tire')) {
    desc = `Buy ${title}. Quality wheels and tyres for all makes and models. Fast delivery across Australia and New Zealand.`;
  } else if (t.includes('scanner') || t.includes('diagnostic') || t.includes('obd') || t.includes('launch')) {
    desc = `Shop ${title}. Professional automotive diagnostic tools for accurate fault reading and vehicle analysis. Fast AU/NZ delivery.`;
  } else if (t.includes('filter') && (t.includes('air') || t.includes('fuel') || t.includes('cabin'))) {
    desc = `Buy ${title}. Quality replacement filters for cleaner performance and engine protection. Fast shipping across Australia and New Zealand.`;
  } else if (t.includes('kit') && t.includes('pack')) {
    desc = `Shop ${title}. Quality automotive parts kit for reliable performance. OEM-spec components with fast delivery to Australia and New Zealand.`;
  } else if (vendor && vendor !== 'Asia Parts Store') {
    desc = `Buy the ${title} from ${vendor}. Quality automotive parts with fast delivery across Australia and New Zealand. OEM-spec and aftermarket options available.`;
  } else {
    desc = `Shop ${title}. Quality automotive parts for Japanese, Korean, and imported vehicles. Fast delivery across Australia and New Zealand.`;
  }

  // Keep description under 155 chars
  if (desc.length > 155) {
    desc = desc.substring(0, 152).trim() + '...';
  }

  return { seoTitle, desc };
}

// ── Step 1: Scan all products and collect missing ──────────────────────────────

async function scanMissing() {
  const missing = [];
  let cursor = null;
  let total = 0;
  let page = 0;

  process.stdout.write('Scanning for missing SEO...');

  while (true) {
    page++;
    const result = await gql(`
      query ($cursor: String) {
        products(first: 250, after: $cursor) {
          edges {
            cursor
            node { id title handle productType vendor seo { title description } }
          }
          pageInfo { hasNextPage }
        }
      }`, { cursor });

    if (result.errors) { console.error('\nError:', JSON.stringify(result.errors)); break; }

    const edges = result.data.products.edges;
    total += edges.length;
    missing.push(...edges.map(e => e.node).filter(p => !p.seo.title));

    process.stdout.write(`\r  Scanned: ${total} | Missing: ${missing.length}   `);

    if (!result.data.products.pageInfo.hasNextPage) break;
    cursor = edges[edges.length - 1].cursor;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nFound ${missing.length} products missing SEO out of ${total} total.\n`);
  return missing;
}

// ── Step 2: Batch update via aliased mutations ─────────────────────────────────

async function batchUpdate(products) {
  const BATCH = 10;
  let updated = 0;
  let failed  = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);

    const aliases = batch.map((p, idx) => {
      const { seoTitle, desc } = generateSeo(p.title, p.productType, p.vendor);
      const t = seoTitle.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const d = desc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `
        p${idx}: productUpdate(input: {
          id: "${p.id}",
          seo: { title: "${t}", description: "${d}" }
        }) {
          product { title seo { title } }
          userErrors { field message }
        }`;
    });

    const result = await gql(`mutation { ${aliases.join('\n')} }`);

    if (result.errors) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, JSON.stringify(result.errors));
      failed += batch.length;
      continue;
    }

    for (const [, val] of Object.entries(result.data || {})) {
      if (val.userErrors?.length) {
        console.error(`  FAIL: ${val.userErrors.map(e => e.message).join(', ')}`);
        failed++;
      } else {
        updated++;
      }
    }

    process.stdout.write(`\r  Updated: ${updated} | Failed: ${failed} | Remaining: ${products.length - i - batch.length}`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\nProduct SEO update complete. Updated: ${updated} | Failed: ${failed}`);
}

// ── Run ────────────────────────────────────────────────────────────────────────
(async () => {
  const missing = await scanMissing();
  if (missing.length === 0) {
    console.log('All products already have SEO titles.');
    return;
  }
  console.log(`Updating ${missing.length} products...`);
  await batchUpdate(missing);
})();
