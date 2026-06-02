const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "aividk-yk.myshopify.com";
const THEME = "157788668134";

async function gql(query, variables = {}) {
  const r = await fetch(`https://${STORE}/admin/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

async function putAsset(key, value) {
  const r = await fetch(`https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json`, {
    method: "PUT",
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ asset: { key, value } }),
  });
  const d = await r.json();
  return d.asset ? `✓ ${key}` : `✗ ${key}: ${JSON.stringify(d.errors)}`;
}

async function getAsset(key) {
  const r = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${key}`,
    { headers: { "X-Shopify-Access-Token": TOKEN } }
  );
  const d = await r.json();
  return d.asset?.value || "";
}

// ── 1. Product image alt texts ────────────────────────────────────────────────
const imageAlts = [
  {
    productId: "gid://shopify/Product/9692163047654",
    mediaId:   "gid://shopify/MediaImage/38358913745126",
    alt: "EcoPowerWall 10 kW pure sine wave inverter — front view showing display and connection ports",
  },
  {
    productId: "gid://shopify/Product/9692163080422",
    mediaId:   "gid://shopify/MediaImage/38358913908966",
    alt: "EcoPowerWall 12 kW pure sine wave inverter — front view with solar and battery input terminals",
  },
  {
    productId: "gid://shopify/Product/9692163113190",
    mediaId:   "gid://shopify/MediaImage/38358913941734",
    alt: "EcoPowerWall 16 kWh LiFePO4 home battery — wall-mounted unit with BMS and connection panel",
  },
  {
    productId: "gid://shopify/Product/9692163145958",
    mediaId:   "gid://shopify/MediaImage/38358914171110",
    alt: "EcoPowerWall 28.7 kWh LiFePO4 home battery — flagship unit showing capacity display and ports",
  },
];

async function updateImageAlts() {
  console.log("\n── Product image alt texts ────────────────────────────");
  for (const item of imageAlts) {
    const { data, errors } = await gql(`
      mutation productUpdateMedia($productId: ID!, $media: [UpdateMediaInput!]!) {
        productUpdateMedia(productId: $productId, media: $media) {
          media { id ... on MediaImage { alt } }
          userErrors { field message }
        }
      }
    `, {
      productId: item.productId,
      media: [{ id: item.mediaId, alt: item.alt }],
    });
    if (errors) { console.log("✗", errors); continue; }
    const ue = data.productUpdateMedia.userErrors;
    if (ue.length) { console.log("✗", ue); continue; }
    console.log("✓ alt set:", item.alt.substring(0, 70) + "...");
  }
}

// ── 2. Noindex empty collections via theme.liquid ────────────────────────────
async function addNoindexEmptyCollections() {
  console.log("\n── Noindex empty collections ──────────────────────────");
  const theme = await getAsset("layout/theme.liquid");

  const oldMeta = `  <meta name="viewport" content="width=device-width, initial-scale=1">`;
  const newMeta = `  <meta name="viewport" content="width=device-width, initial-scale=1">
  {%- if request.page_type == 'collection' and collection.products_count == 0 -%}
    <meta name="robots" content="noindex, follow">
  {%- endif -%}`;

  if (theme.includes("noindex") || !theme.includes(oldMeta)) {
    console.log("  skipped — noindex already present or anchor not found");
    return;
  }

  const updated = theme.replace(oldMeta, newMeta);
  console.log(await putAsset("layout/theme.liquid", updated));
}

// ── 3. Richer product descriptions ───────────────────────────────────────────
const descriptions = {
  "gid://shopify/Product/9692163047654": `<p>The EcoPowerWall 10 kW Inverter delivers 10,000W of continuous pure sine wave AC output — enough to power a 3-bedroom home's essential loads simultaneously. Featuring a built-in MPPT solar charge controller, it connects directly to your solar array and battery bank for a seamless all-in-one energy hub.</p>

<h2>Key Specifications</h2>
<ul>
  <li><strong>Continuous output:</strong> 10,000W</li>
  <li><strong>Peak output:</strong> 20,000W (surge)</li>
  <li><strong>Output waveform:</strong> Pure sine wave</li>
  <li><strong>Input voltage:</strong> 48V DC</li>
  <li><strong>Output voltage:</strong> 120V/240V AC</li>
  <li><strong>MPPT solar input:</strong> 145V max VOC, 80A</li>
  <li><strong>Efficiency:</strong> 95.5%</li>
  <li><strong>Operating temperature:</strong> -20°C to +55°C</li>
  <li><strong>Warranty:</strong> 2 years</li>
</ul>

<h2>What It Powers</h2>
<p>The 10 kW inverter handles standard home loads including central air conditioning, refrigerators, washing machines, lighting, routers, and entertainment systems — all running simultaneously. Compatible with the EcoPowerWall 16 kWh and 28.7 kWh LiFePO4 batteries.</p>

<h2>Solar Integration</h2>
<p>The built-in MPPT charge controller accepts up to 8 kW of solar input, automatically prioritizing solar charging before drawing from the battery or grid. Supports grid-tie, off-grid, and hybrid operating modes with automatic transfer switching in under 20ms.</p>

<h2>Perfect For</h2>
<ul>
  <li>Homes up to 2,500 sq ft with standard appliance loads</li>
  <li>Solar arrays up to 8 kW</li>
  <li>Off-grid cabins and rural properties</li>
  <li>Whole-home backup power during outages</li>
</ul>`,

  "gid://shopify/Product/9692163080422": `<p>Our flagship 12 kW Inverter provides 12,000W of continuous pure sine wave output — ideal for larger homes, light commercial applications, and high-demand solar setups. The advanced MPPT controller handles up to 16 kW of solar input, making it the perfect companion for a full-size solar array.</p>

<h2>Key Specifications</h2>
<ul>
  <li><strong>Continuous output:</strong> 12,000W</li>
  <li><strong>Peak output:</strong> 24,000W (surge)</li>
  <li><strong>Output waveform:</strong> Pure sine wave</li>
  <li><strong>Input voltage:</strong> 48V DC</li>
  <li><strong>Output voltage:</strong> 120V/240V AC</li>
  <li><strong>MPPT solar input:</strong> 145V max VOC, 120A</li>
  <li><strong>Efficiency:</strong> 96%</li>
  <li><strong>Operating temperature:</strong> -20°C to +55°C</li>
  <li><strong>Warranty:</strong> 2 years</li>
</ul>

<h2>What It Powers</h2>
<p>The 12 kW inverter handles the most demanding home loads: central HVAC systems, EV chargers (Level 2), electric ranges, dryers, hot water heaters, and full home appliance loads running concurrently. Compatible with the EcoPowerWall 16 kWh and 28.7 kWh LiFePO4 home batteries.</p>

<h2>Solar Integration</h2>
<p>With 120A MPPT capacity, the 12 kW inverter accepts up to 16 kW of solar panels — enough for a full residential solar array. Automatic mode switching between solar, battery, and grid ensures the lowest possible electricity cost around the clock.</p>

<h2>Perfect For</h2>
<ul>
  <li>Homes 2,500–5,000 sq ft with heavy appliance loads</li>
  <li>Solar arrays up to 16 kW</li>
  <li>EV charging combined with home backup</li>
  <li>Light commercial and agricultural properties</li>
</ul>`,

  "gid://shopify/Product/9692163113190": `<p>The EcoPowerWall 16 kWh battery is the ideal entry point for whole-home energy storage. With 16 kWh of usable capacity and LiFePO4 chemistry, it can power a typical home's essential loads for 24–36 hours on a single charge — and up to 6,000 charge cycles over its lifetime.</p>

<h2>Key Specifications</h2>
<ul>
  <li><strong>Usable capacity:</strong> 16 kWh</li>
  <li><strong>Chemistry:</strong> LiFePO4 (Lithium Iron Phosphate)</li>
  <li><strong>Nominal voltage:</strong> 48V</li>
  <li><strong>Depth of discharge:</strong> 95%</li>
  <li><strong>Cycle life:</strong> 6,000+ cycles at 80% capacity retention</li>
  <li><strong>Round-trip efficiency:</strong> 96%</li>
  <li><strong>Operating temperature:</strong> -20°C to +55°C</li>
  <li><strong>Warranty:</strong> 5 years</li>
  <li><strong>Expandable:</strong> Yes — stack up to 28.7 kWh</li>
</ul>

<h2>Why LiFePO4?</h2>
<p>Lithium Iron Phosphate (LiFePO4) is the safest lithium battery chemistry — non-flammable, thermally stable, and rated for 6,000+ cycles. Unlike NMC batteries (used by some competitors), LiFePO4 cells do not undergo thermal runaway, making them safe for indoor installation.</p>

<h2>What It Stores and Powers</h2>
<p>16 kWh is enough to power essential home loads — refrigerator, lighting, router, TV, phone charging, and fans — for 24–36 hours. Paired with an EcoPowerWall inverter and solar panels, it stores excess solar energy for nighttime use and grid-outage backup.</p>

<h2>Perfect For</h2>
<ul>
  <li>2–4 bedroom homes with average daily energy use under 30 kWh</li>
  <li>Daily solar storage and time-of-use rate optimization</li>
  <li>Essential load backup during outages (24–36 hrs)</li>
  <li>Entry-level whole-home energy storage with upgrade path</li>
</ul>`,

  "gid://shopify/Product/9692163145958": `<p>The EcoPowerWall 28.7 kWh battery is our most powerful home storage solution — delivering genuine energy independence. With over twice the capacity of a Tesla Powerwall 3, it can power your entire home for 18–24 hours without any solar input. Paired with solar panels, you can go days without drawing from the grid.</p>

<h2>Why It's Our Best Seller</h2>
<p>28.7 kWh covers everything — HVAC, EV charging, kitchen appliances, lighting, entertainment, and more. Whether you're preparing for extended outages, going off-grid, or maximizing solar self-consumption, this is the system that delivers.</p>

<h2>Key Specifications</h2>
<ul>
  <li><strong>Usable capacity:</strong> 28.7 kWh</li>
  <li><strong>Chemistry:</strong> LiFePO4 (Lithium Iron Phosphate)</li>
  <li><strong>Nominal voltage:</strong> 48V</li>
  <li><strong>Depth of discharge:</strong> 95%</li>
  <li><strong>Cycle life:</strong> 6,000+ cycles at 80% capacity retention</li>
  <li><strong>Round-trip efficiency:</strong> 96%</li>
  <li><strong>Operating temperature:</strong> -20°C to +55°C</li>
  <li><strong>Warranty:</strong> 10 years</li>
  <li><strong>Compare:</strong> 2.1× capacity of Tesla Powerwall 3 (13.5 kWh)</li>
</ul>

<h2>Backup Duration</h2>
<p>A typical 3-bedroom home uses 1.2–1.5 kWh/hr on essential loads. At this rate, 28.7 kWh provides 18–24 hours of full-home backup — or several days of essential-load-only backup. With a matched solar array recharging during the day, outages can be weathered indefinitely.</p>

<h2>LiFePO4 Safety & Longevity</h2>
<p>LiFePO4 chemistry is inherently non-flammable and thermally stable — safe for garage, basement, or utility room installation without the fire risk of NMC batteries. At 6,000 cycles with 80% capacity retention, this battery lasts 16+ years of daily use.</p>

<h2>Perfect For</h2>
<ul>
  <li>Homes 2,000–5,000 sq ft with full appliance loads including HVAC</li>
  <li>EV owners who want to charge from solar overnight</li>
  <li>Off-grid and remote properties</li>
  <li>Homeowners in high-outage areas or with critical load requirements</li>
  <li>Maximum solar self-consumption and utility bill elimination</li>
</ul>`,
};

async function updateDescriptions() {
  console.log("\n── Product descriptions ────────────────────────────────");
  for (const [id, descriptionHtml] of Object.entries(descriptions)) {
    const { data, errors } = await gql(`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id title }
          userErrors { field message }
        }
      }
    `, { input: { id, descriptionHtml } });
    if (errors) { console.log("✗", id, errors); continue; }
    const ue = data.productUpdate.userErrors;
    if (ue.length) { console.log("✗", id, ue); continue; }
    console.log("✓", data.productUpdate.product.title);
  }
}

// ── 4. ItemList schema on homepage ───────────────────────────────────────────
async function addItemListSchema() {
  console.log("\n── ItemList schema on homepage ─────────────────────────");
  const schema = await getAsset("snippets/schema.liquid");

  const itemListBlock = `
{%- if request.page_type == 'index' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "EcoPowerWall Home Energy Products",
  "url": "{{ shop.url }}",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "16 kWh LiFePO4 Home Battery", "url": "{{ shop.url }}/products/16kwh-battery" },
    { "@type": "ListItem", "position": 2, "name": "28.7 kWh LiFePO4 Home Battery", "url": "{{ shop.url }}/products/28kwh-battery" },
    { "@type": "ListItem", "position": 3, "name": "10 kW Pure Sine Wave Inverter",  "url": "{{ shop.url }}/products/10kw-inverter" },
    { "@type": "ListItem", "position": 4, "name": "12 kW Pure Sine Wave Inverter",  "url": "{{ shop.url }}/products/12kw-inverter" }
  ]
}
</script>
{%- endif -%}
`;

  if (schema.includes("ItemList")) {
    console.log("  skipped — ItemList already present");
    return;
  }

  // Append before the FAQPage block
  const updated = schema.replace(
    "{%- if request.page_type == 'index' -%}\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\"",
    itemListBlock.trimStart() + "{%- if request.page_type == 'index' -%}\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\""
  );

  console.log(await putAsset("snippets/schema.liquid", updated));
}

(async () => {
  await updateImageAlts();
  await addNoindexEmptyCollections();
  await updateDescriptions();
  await addItemListSchema();
  console.log("\nPhase 5 complete.");
})();
