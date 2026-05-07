require('dotenv').config();

const SHOP  = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API   = `https://${SHOP}/admin/api/2024-01/graphql.json`;

const updates = [
  // ── Batch 1: Null SEO public collections ─────────────────────────────────
  {
    id: 'gid://shopify/Collection/497153638718',
    title: 'Car Lighting and Electrical Parts | Asia Parts Store',
    description: 'Shop car lighting and electrical parts including headlights, taillights, LED upgrades, and wiring for all makes and models. Fast delivery across Australia and New Zealand.',
  },
  {
    id: 'gid://shopify/Collection/497154294078',
    title: 'Flash Deals — Car Parts at Discounted Prices | Asia Parts Store',
    description: 'Shop Asia Parts Store flash deals for limited-time discounts on car parts, suspension, brakes, and performance accessories. Deals updated regularly.',
  },
  {
    id: 'gid://shopify/Collection/497417683262',
    title: 'General Auto Parts for All Makes and Models | Asia Parts Store',
    description: 'Shop general auto parts for Japanese, Korean, and Australian vehicles. Filters, gaskets, belts, sensors, and everyday replacement components with fast AU/NZ delivery.',
  },
  {
    id: 'gid://shopify/Collection/497419190590',
    title: 'Car Lighting and Electrical Parts | Asia Parts Store',
    description: 'Shop car lighting and electrical parts including headlights, taillights, globes, wiring harnesses, and sensors for all makes and models. Fast delivery across Australia and New Zealand.',
  },
  {
    id: 'gid://shopify/Collection/497536631102',
    title: 'Engine Piston Sets and Kits | Asia Parts Store',
    description: 'Shop engine piston sets for performance builds and OE replacement. Forged and cast piston kits for Japanese and imported engines. Fast Australia-wide delivery.',
  },
  {
    id: 'gid://shopify/Collection/497536762174',
    title: 'Suspension Bushing Kits | Asia Parts Store',
    description: 'Shop polyurethane and rubber suspension bushing kits for improved handling and reduced noise. Replacement and performance bushings for all vehicle makes and models.',
  },
  {
    id: 'gid://shopify/Collection/497536827710',
    title: 'Window and Hood Deflectors | Asia Parts Store',
    description: 'Shop wind deflectors, rain guards, and hood deflectors for cars, SUVs, and utes. Reduce wind noise and protect your interior from rain with quality deflectors.',
  },
  {
    id: 'gid://shopify/Collection/497537089854',
    title: 'Brake Caliper Covers | Asia Parts Store',
    description: 'Enhance your brake appearance with caliper covers. Easy-fit brake caliper covers in multiple colours to upgrade the look of your wheels and calipers. Fast AU/NZ shipping.',
  },
  {
    id: 'gid://shopify/Collection/497537581374',
    title: 'Shock Mounts and Adjustable Camber Plates | Asia Parts Store',
    description: 'Shop performance shock mounts and adjustable camber plates for improved suspension geometry and handling. Compatible with popular coilover systems and strut setups.',
  },
  {
    id: 'gid://shopify/Collection/497537646910',
    title: 'Engine Gasket Kits | Asia Parts Store',
    description: 'Shop full engine gasket kits and individual gaskets for head, intake, exhaust, and valve cover applications. OE-spec and performance gaskets for all makes and models.',
  },
  // ── Batch 2: Remaining null + weak rewrites ───────────────────────────────
  {
    id: 'gid://shopify/Collection/497537712446',
    title: 'Performance Camshafts | Asia Parts Store',
    description: "Upgrade your engine's power band with performance camshafts. Street and race-spec profiles for Japanese and imported engines. Improve power, torque, and throttle response.",
  },
  {
    id: 'gid://shopify/Collection/497537777982',
    title: 'Engine and Wheel Bearings | Asia Parts Store',
    description: 'Shop engine and wheel bearings for smooth, reliable performance. Replacement and performance bearings for all makes and models. Fast Australia and New Zealand delivery.',
  },
  {
    id: 'gid://shopify/Collection/497537909054',
    title: 'Head Gaskets and MLS Head Gaskets | Asia Parts Store',
    description: 'Shop OEM-spec and performance head gaskets for all engine types. Multi-layer steel and standard head gaskets for Japanese, Korean, and imported vehicles.',
  },
  {
    id: 'gid://shopify/Collection/497537941822',
    title: 'Performance Mufflers and Exhaust Mufflers | Asia Parts Store',
    description: 'Shop performance and replacement exhaust mufflers for improved sound and flow. Straight-through, chambered, and OE-spec mufflers for all makes and models.',
  },
  {
    id: 'gid://shopify/Collection/497538072894',
    title: 'Axle-Back Exhaust Systems | Asia Parts Store',
    description: 'Upgrade your exhaust tone with axle-back exhaust systems. Easy bolt-on installation from the rear axle back for improved sound with minimal modification.',
  },
  // ── Weak SEO rewrites ─────────────────────────────────────────────────────
  {
    id: 'gid://shopify/Collection/497537220926',
    title: 'Big Brake Kits and Brake Upgrade Kits | Asia Parts Store',
    description: 'Upgrade to bigger brakes with complete big brake kits. Multi-piston calipers, larger rotors, and braided lines for maximum stopping power on track and street.',
  },
  {
    id: 'gid://shopify/Collection/497537843518',
    title: 'Performance Valve Springs and Retainers | Asia Parts Store',
    description: 'Shop performance valve springs and titanium retainers for high-revving engines. Essential upgrades for camshaft installs and high-RPM engine builds on Japanese and imported vehicles.',
  },
  {
    id: 'gid://shopify/Collection/497538040126',
    title: 'Exhaust Resonators and Muffler Resonators | Asia Parts Store',
    description: 'Shop exhaust resonators to reduce drone and refine exhaust tone. Direct-fit and universal resonators for cat-back and custom exhaust systems on all makes and models.',
  },
  {
    id: 'gid://shopify/Collection/497538138430',
    title: 'Exhaust Gaskets and Exhaust Manifold Gaskets | Asia Parts Store',
    description: 'Shop exhaust gaskets and manifold gaskets for a leak-free seal. OE-spec and performance exhaust gaskets for Japanese, Korean, and imported vehicles. Fast AU/NZ delivery.',
  },
];

async function gql(query) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

function buildBatchMutation(batch) {
  const aliases = batch.map((col, i) => {
    const seoTitle = col.title.replace(/"/g, '\\"');
    const seoDesc  = col.description.replace(/"/g, '\\"');
    return `
      col${i}: collectionUpdate(input: {
        id: "${col.id}",
        seo: { title: "${seoTitle}", description: "${seoDesc}" }
      }) {
        collection { id title seo { title description } }
        userErrors { field message }
      }`;
  });
  return `mutation { ${aliases.join('\n')} }`;
}

async function runBatch(batch, batchNum) {
  console.log(`\nRunning batch ${batchNum} (${batch.length} collections)...`);
  const mutation = buildBatchMutation(batch);
  const result   = await gql(mutation);

  if (result.errors) {
    console.error(`Batch ${batchNum} error:`, JSON.stringify(result.errors, null, 2));
    return;
  }

  for (const [key, val] of Object.entries(result.data || {})) {
    const col = val.collection;
    if (val.userErrors?.length) {
      console.error(`  FAIL [${key}]: ${val.userErrors.map(e => e.message).join(', ')}`);
    } else {
      console.log(`  OK   "${col.title}" → "${col.seo.title}"`);
    }
  }
}

async function verify() {
  console.log('\nVerifying all collections...');
  const query = `{
    collections(first: 50) {
      edges {
        node { title handle seo { title description } }
      }
    }
  }`;
  const result = await gql(query);
  const cols   = result.data.collections.edges.map(e => e.node);

  const missing = cols.filter(
    c => !c.seo.title && !['oos-1', 'allied-auto-online'].includes(c.handle)
  );

  if (missing.length === 0) {
    console.log('\nPhase 1 complete — all public collections have SEO metadata.');
  } else {
    console.log(`\n${missing.length} collections still missing SEO:`);
    missing.forEach(c => console.log(`  - ${c.title} (${c.handle})`));
  }
}

(async () => {
  const BATCH_SIZE = 10;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    await runBatch(updates.slice(i, i + BATCH_SIZE), Math.floor(i / BATCH_SIZE) + 1);
  }
  await verify();
})();
