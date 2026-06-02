const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "aividk-yk.myshopify.com";
const THEME  = "157788668134";
const BLOG   = 98105098470;

async function rest(path, method = "GET", body = null) {
  const r = await fetch(`https://${STORE}/admin/api/2024-01${path}`, {
    method,
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  });
  return r.json();
}

async function gql(query, variables = {}) {
  const r = await fetch(`https://${STORE}/admin/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

async function getAsset(key) {
  const r = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${key}`,
    { headers: { "X-Shopify-Access-Token": TOKEN } }
  );
  return (await r.json()).asset?.value || "";
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

// ── 1. Redirects for duplicate pages ─────────────────────────────────────────
async function createRedirects() {
  console.log("\n── Duplicate page redirects ───────────────────────────");
  const pairs = [
    { from: "/pages/faqs-1",        to: "/pages/faqs" },
    { from: "/pages/track-order-1", to: "/pages/track-order" },
  ];
  for (const pair of pairs) {
    const d = await rest("/redirects.json", "POST", { redirect: pair });
    if (d.redirect?.id) {
      console.log(`✓ ${pair.from} → ${pair.to}`);
    } else {
      console.log(`✗ ${pair.from}:`, JSON.stringify(d.errors || d));
    }
  }
}

// ── 2. Set SEO meta on existing articles via metafieldsSet ───────────────────
const existingArticleSEO = [
  {
    id: "gid://shopify/Article/596232667366",
    title: "5 Ways to Prepare Your Home for Power Outages in 2025 | EcoPowerWall",
    description: "Discover 5 proven strategies to protect your home during power outages — from home battery storage to backup inverters. Be ready before the next blackout.",
  },
  {
    id: "gid://shopify/Article/596232634598",
    title: "Solar + Battery Storage: How to Maximize Energy Independence | EcoPowerWall",
    description: "Learn how pairing solar panels with a LiFePO4 home battery lets you store excess energy, cut electricity bills, and stay powered during outages.",
  },
  {
    id: "gid://shopify/Article/596232601830",
    title: "Why LiFePO4 Is the Best Battery Chemistry for Home Storage | EcoPowerWall",
    description: "LiFePO4 batteries outlast NMC, won't catch fire, and cycle 6,000+ times. Here's why they're the gold standard for residential energy storage.",
  },
];

async function updateExistingArticleSEO() {
  console.log("\n── Existing article SEO meta ──────────────────────────");
  for (const a of existingArticleSEO) {
    const { data, errors } = await gql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { namespace key value }
          userErrors { field message }
        }
      }
    `, {
      metafields: [
        { ownerId: a.id, namespace: "global", key: "title_tag",       value: a.title,       type: "single_line_text_field" },
        { ownerId: a.id, namespace: "global", key: "description_tag", value: a.description, type: "single_line_text_field" },
      ],
    });
    if (errors || data.metafieldsSet.userErrors.length) {
      console.log("✗", a.id, errors || data.metafieldsSet.userErrors);
      continue;
    }
    console.log("✓", a.title.substring(0, 65) + "...");
  }
}

// ── 3. Expand existing article body content ───────────────────────────────────
const expandedArticles = [
  {
    id: 596232667366,
    body_html: `<p>Power outages are becoming longer and more frequent across the US. Whether caused by extreme weather, grid failures, or infrastructure issues, the average American experiences nearly 8 hours of power interruption per year — and that number is rising. Here are 5 concrete steps to protect your home before the next blackout.</p>

<h2>1. Install a Home Battery Storage System</h2>
<p>A whole-home battery like the <a href="/products/28kwh-battery">EcoPowerWall 28.7 kWh LiFePO4 battery</a> gives you 18–24 hours of full-home power when the grid goes down. Unlike portable generators, a battery system switches over in under 20 milliseconds — before your lights even flicker. No noise, no fumes, no fuel.</p>
<p>For most 3–4 bedroom homes, a 16 kWh battery covers essential loads (refrigerator, lights, router, phones, fans) for 24–36 hours. For complete protection including HVAC and EV charging, the 28.7 kWh unit is the right choice.</p>

<h2>2. Add a Hybrid Inverter to Manage Multiple Power Sources</h2>
<p>A <a href="/products/10kw-inverter">pure sine wave hybrid inverter</a> automatically manages power from solar panels, your battery bank, and the grid — switching between sources based on availability and price. During an outage, it disconnects from the grid (required by code) and powers your home from battery and solar alone.</p>
<p>Look for an inverter with automatic transfer switching (ATS) built in. Both the EcoPowerWall 10 kW and 12 kW inverters include ATS with sub-20ms switchover time.</p>

<h2>3. Identify and Protect Your Critical Loads</h2>
<p>Before sizing a battery system, list the appliances you absolutely need during an outage:</p>
<ul>
  <li><strong>Medical equipment</strong> (CPAP, nebulizers, oxygen concentrators)</li>
  <li><strong>Refrigerator and freezer</strong> — approximately 150–200W average draw</li>
  <li><strong>Lighting</strong> — LED lights draw 10–15W per room</li>
  <li><strong>Router and communications</strong> — 10–20W</li>
  <li><strong>Phone and laptop charging</strong> — 50–100W</li>
  <li><strong>Sump pump</strong> — critical in flood-prone areas (750W–1,500W)</li>
</ul>
<p>Add up the wattage and multiply by hours to calculate your daily kWh requirement. Use our <a href="/pages/sizing-guide">battery sizing guide</a> for a step-by-step calculation.</p>

<h2>4. Connect Solar Panels for Indefinite Backup</h2>
<p>A battery alone gives you a fixed window of backup. Pair it with solar panels and your backup becomes indefinite — the battery recharges every day from the sun, regardless of how long the grid is down. Even on cloudy days, a 5–10 kW solar array will partially recharge a 28.7 kWh battery.</p>
<p>EcoPowerWall inverters include built-in MPPT solar charge controllers, so no separate solar charge controller is required. The 10 kW inverter handles up to 8 kW of solar; the 12 kW handles up to 16 kW.</p>

<h2>5. Take Advantage of Federal Tax Credits</h2>
<p>Under the Inflation Reduction Act, standalone battery storage systems installed from 2023 onward qualify for the <strong>30% federal Investment Tax Credit (ITC)</strong> — no solar required. On a $7,000 battery installation, that's a $2,100 tax credit directly reducing what you owe the IRS.</p>
<p>Many states offer additional incentives on top of the federal credit. Visit our <a href="/pages/incentives">incentives page</a> for a state-by-state breakdown.</p>

<h2>Start Your Outage Preparation Today</h2>
<p>The best time to prepare for a power outage is before it happens. <a href="/pages/help-me-choose">Use our system selector</a> to find the right battery and inverter combination for your home, or <a href="/pages/contact">contact our team</a> for a personalized recommendation.</p>`,
  },
  {
    id: 596232634598,
    body_html: `<p>Solar panels produce power when the sun shines — but most homes use more electricity in the morning and evening than at midday. Without storage, that excess solar energy flows back to the grid at wholesale prices, while you buy it back at retail rates after sunset. A home battery changes that equation entirely.</p>

<h2>How Solar + Battery Storage Works Together</h2>
<p>A hybrid solar-plus-storage system works in a simple loop:</p>
<ol>
  <li><strong>Solar panels generate power</strong> during daylight hours</li>
  <li><strong>Your home uses solar power first</strong> — reducing grid draw to near zero during the day</li>
  <li><strong>Excess solar charges the battery</strong> instead of going to the grid</li>
  <li><strong>After sunset, the battery powers your home</strong> — avoiding peak-rate grid electricity</li>
  <li><strong>During outages, battery + solar keep your home running</strong> indefinitely</li>
</ol>
<p>The EcoPowerWall <a href="/products/10kw-inverter">10 kW</a> and <a href="/products/12kw-inverter">12 kW</a> hybrid inverters manage all of this automatically — no manual switching required.</p>

<h2>How Much Can You Save?</h2>
<p>Savings depend on your electricity rate, solar array size, and battery capacity. Here's a realistic example:</p>
<ul>
  <li>Home in California (average rate: $0.28/kWh)</li>
  <li>10 kW solar array generating 40 kWh/day average</li>
  <li>Home uses 30 kWh/day (10 kWh used during solar hours, 20 kWh at night)</li>
  <li>Without storage: 20 kWh bought from grid nightly × $0.28 = <strong>$5.60/day ($2,044/year)</strong></li>
  <li>With a 28.7 kWh battery: grid draw drops to near zero = <strong>savings of $1,800–$2,000/year</strong></li>
</ul>
<p>Payback periods of 5–8 years are common in high-rate states, with the 30% federal ITC reducing upfront cost further.</p>

<h2>Choosing the Right Battery Size for Solar Pairing</h2>
<p>Match your battery to your evening + nighttime load, not your total daily usage. Most homes need 16–30 kWh to cover overnight consumption:</p>
<ul>
  <li><strong><a href="/products/16kwh-battery">16 kWh battery</a>:</strong> Covers 10–15 kWh of overnight load — ideal for 2–3 bedroom homes with gas heating/cooking</li>
  <li><strong><a href="/products/28kwh-battery">28.7 kWh battery</a>:</strong> Covers 20–28 kWh overnight — ideal for larger homes, electric cooking/heating, or EV charging overnight</li>
</ul>

<h2>Grid-Tie, Off-Grid, or Hybrid?</h2>
<p>EcoPowerWall systems support all three configurations:</p>
<ul>
  <li><strong>Grid-tied with backup:</strong> Stay connected to the grid but use battery and solar first. Most common setup for suburban homes.</li>
  <li><strong>Hybrid:</strong> Connected to grid but automatically disconnects during outages. Seamless backup with no manual action.</li>
  <li><strong>Off-grid:</strong> Fully independent — no utility connection. Requires larger solar array and battery bank sized for worst-case winter days.</li>
</ul>
<p>Learn more about each configuration on our <a href="/pages/off-grid">off-grid</a>, <a href="/pages/on-grid">on-grid</a>, and <a href="/pages/hybrid-systems">hybrid systems</a> pages.</p>

<h2>Next Steps</h2>
<p>Ready to design your solar + battery system? Start with our <a href="/pages/sizing-guide">battery sizing guide</a> or <a href="/pages/contact">contact our team</a> for a free system recommendation based on your energy bills.</p>`,
  },
  {
    id: 596232601830,
    body_html: `<p>Not all lithium batteries are the same. If you've been researching home energy storage, you've likely encountered two main chemistries: LiFePO4 (Lithium Iron Phosphate) and NMC (Nickel Manganese Cobalt). Understanding the difference matters — it affects safety, lifespan, and long-term value. Here's what you need to know.</p>

<h2>What Is LiFePO4?</h2>
<p>LiFePO4 stands for Lithium Iron Phosphate — a lithium-ion battery chemistry where iron and phosphate replace the nickel, manganese, and cobalt used in NMC cells. This substitution fundamentally changes the battery's properties in ways that favor home energy storage.</p>

<h2>Safety: LiFePO4 Wins Decisively</h2>
<p>The most important difference for home installations is thermal stability. NMC batteries can undergo <strong>thermal runaway</strong> — a chain reaction where heat generates more heat, potentially resulting in fire. This is why Tesla Powerwalls and some competitors include elaborate cooling systems and fire suppression.</p>
<p>LiFePO4 chemistry does not undergo thermal runaway under any normal operating conditions. The iron-phosphate bond is chemically stable even at high temperatures and under physical damage. You can install an EcoPowerWall battery in your garage, basement, or utility room without fire risk concerns.</p>

<h2>Cycle Life: 6,000+ vs. 2,000–3,000 Cycles</h2>
<p>A "cycle" is one full charge and discharge. Here's how the chemistries compare:</p>
<ul>
  <li><strong>LiFePO4:</strong> 6,000+ cycles at 80% capacity retention — approximately 16+ years of daily use</li>
  <li><strong>NMC:</strong> 2,000–3,000 cycles at 80% retention — approximately 5–8 years of daily use</li>
</ul>
<p>The EcoPowerWall <a href="/products/28kwh-battery">28.7 kWh battery</a> is rated for 6,000 cycles with a 10-year warranty. At one cycle per day, that's 16+ years — longer than most solar panel warranties.</p>

<h2>Energy Density: NMC Is More Compact</h2>
<p>NMC has higher energy density — more watt-hours per kilogram. This makes it ideal for electric vehicles where weight matters. For a stationary home battery bolted to a wall, energy density is largely irrelevant. You have space; you need safety and longevity.</p>

<h2>Cost: LiFePO4 Now Competitive</h2>
<p>LiFePO4 was historically more expensive per kWh than NMC, but falling iron phosphate cell prices have eliminated most of the gap. When you factor in the longer lifespan (cost per cycle), LiFePO4 is now cheaper over a 10-year horizon in nearly every analysis.</p>

<h2>Summary: LiFePO4 vs. NMC for Home Storage</h2>
<table>
  <thead><tr><th>Property</th><th>LiFePO4</th><th>NMC</th></tr></thead>
  <tbody>
    <tr><td>Thermal safety</td><td>✅ No thermal runaway</td><td>⚠️ Risk of thermal runaway</td></tr>
    <tr><td>Cycle life</td><td>✅ 6,000+ cycles</td><td>❌ 2,000–3,000 cycles</td></tr>
    <tr><td>Operating temp range</td><td>✅ -20°C to +60°C</td><td>⚠️ Narrower range</td></tr>
    <tr><td>Energy density</td><td>⚠️ Moderate</td><td>✅ Higher</td></tr>
    <tr><td>10-yr cost of ownership</td><td>✅ Lower (longer life)</td><td>❌ Higher (replacement)</td></tr>
    <tr><td>Best for</td><td>✅ Home & stationary</td><td>✅ EVs & mobile</td></tr>
  </tbody>
</table>

<h2>Why EcoPowerWall Uses LiFePO4</h2>
<p>Every EcoPowerWall battery uses LiFePO4 cells for exactly these reasons. Our <a href="/products/16kwh-battery">16 kWh</a> and <a href="/products/28kwh-battery">28.7 kWh</a> batteries are designed for daily cycling over a decade or more — LiFePO4 is the only chemistry that delivers that reliably at home storage scale.</p>
<p>Have questions? <a href="/pages/contact">Contact our team</a> or visit our <a href="/pages/faqs">FAQ page</a> for more answers.</p>`,
  },
];

async function expandArticles() {
  console.log("\n── Expand existing article content ────────────────────");
  for (const a of expandedArticles) {
    const d = await rest(`/blogs/${BLOG}/articles/${a.id}.json`, "PUT", {
      article: { id: a.id, body_html: a.body_html },
    });
    if (d.article?.id) {
      console.log(`✓ expanded: ${d.article.title} (${a.body_html.replace(/<[^>]+>/g,"").length} chars)`);
    } else {
      console.log(`✗ ${a.id}:`, JSON.stringify(d.errors));
    }
  }
}

// ── 4. New SEO-targeted blog articles ────────────────────────────────────────
const newArticles = [
  {
    title: "How to Size a Home Battery: How Much Storage Do You Actually Need?",
    handle: "how-to-size-home-battery-storage",
    tags: "battery sizing, home energy, LiFePO4, storage guide",
    seo_title: "Home Battery Sizing Guide: How Much Storage Do You Need? | EcoPowerWall",
    seo_desc: "Calculate the right home battery size for your needs. Learn how to match kWh capacity to your daily usage, backup goals, and solar array size.",
    body_html: `<p>One of the most common questions we hear: "How big a battery do I need?" The answer depends on what you're trying to accomplish — daily solar storage, outage backup, or full off-grid capability. This guide walks through each scenario with real numbers.</p>

<h2>Step 1: Know Your Daily Energy Use</h2>
<p>Check your electricity bill for your monthly kWh usage. Divide by 30 to get your daily average. US average is about 30 kWh/day, but this varies enormously:</p>
<ul>
  <li>Small apartment: 10–15 kWh/day</li>
  <li>2–3 bedroom home (gas appliances): 20–25 kWh/day</li>
  <li>3–4 bedroom home (some electric): 30–40 kWh/day</li>
  <li>Large home with EV + electric heat: 50–80+ kWh/day</li>
</ul>

<h2>Step 2: Define Your Goal</h2>
<h3>Goal A: Daily Solar Self-Consumption</h3>
<p>You want to store excess solar from midday and use it at night. Size the battery to your <em>evening and overnight load</em>, not your full daily use. Most homes with solar need 10–20 kWh of evening storage:</p>
<ul>
  <li>Average home with solar, gas heat/cooking: <strong>16 kWh battery</strong> is typically sufficient</li>
  <li>Home with EV charging or all-electric appliances: <strong>28.7 kWh battery</strong> recommended</li>
</ul>

<h3>Goal B: Backup Power During Outages</h3>
<p>Calculate your essential load (what you can't live without) × hours of backup needed:</p>
<ul>
  <li>Essential loads only (fridge, lights, router, phones): ~1.0–1.5 kWh/hr</li>
  <li>Essential + one HVAC zone: ~2.5–3.5 kWh/hr</li>
  <li>Whole home including HVAC: ~3.5–5.5 kWh/hr</li>
</ul>
<p>For 12 hours of whole-home backup at 4 kWh/hr: 48 kWh needed. Two <a href="/products/28kwh-battery">28.7 kWh batteries</a> stacked (57.4 kWh) covers this with room to spare. For 24 hours of essential loads at 1.5 kWh/hr: 36 kWh — the 28.7 kWh battery gets you 19 hours, with solar topping it up through the day.</p>

<h3>Goal C: Off-Grid Living</h3>
<p>Off-grid sizing must account for your worst-case days — typically a stretch of cloudy winter days. Rule of thumb: size your battery to cover 2–3 days of essential load without solar input, then size your solar array to fully recharge in a single good day.</p>
<p>For a 1,500 sq ft off-grid home using 15 kWh/day: 3-day reserve = 45 kWh. Two 28.7 kWh batteries (57.4 kWh) works well here.</p>

<h2>Quick Reference: Which EcoPowerWall Battery Is Right for You?</h2>
<table>
  <thead><tr><th>Scenario</th><th>Recommended Battery</th></tr></thead>
  <tbody>
    <tr><td>Daily solar storage, 2–3 BR home</td><td><a href="/products/16kwh-battery">16 kWh Battery</a></td></tr>
    <tr><td>Daily solar + overnight EV charging</td><td><a href="/products/28kwh-battery">28.7 kWh Battery</a></td></tr>
    <tr><td>24-hr whole-home outage backup</td><td><a href="/products/28kwh-battery">28.7 kWh Battery</a></td></tr>
    <tr><td>Off-grid cabin or rural property</td><td>28.7 kWh × 2 (stacked)</td></tr>
    <tr><td>Business backup / light commercial</td><td>28.7 kWh × 2–4</td></tr>
  </tbody>
</table>

<h2>Don't Forget the Inverter</h2>
<p>Your battery needs a compatible inverter to convert stored DC power to AC. EcoPowerWall offers:</p>
<ul>
  <li><a href="/products/10kw-inverter"><strong>10 kW inverter</strong></a>: Up to 8 kW solar input. Best for homes up to 2,500 sq ft with standard loads.</li>
  <li><a href="/products/12kw-inverter"><strong>12 kW inverter</strong></a>: Up to 16 kW solar input. Best for large homes, EV chargers, and heavy appliances.</li>
</ul>

<h2>Get a Personalized Recommendation</h2>
<p>Still unsure? Use our <a href="/pages/help-me-choose">interactive system selector</a> or <a href="/pages/contact">contact our energy advisors</a>. We'll review your electricity bills and recommend the right system for your home and budget.</p>`,
  },
  {
    title: "Federal Tax Credit for Home Battery Storage: 2025 Guide",
    handle: "federal-tax-credit-home-battery-storage-2025",
    tags: "federal tax credit, ITC, incentives, savings, LiFePO4",
    seo_title: "Federal Tax Credit for Home Battery Storage in 2025 | EcoPowerWall",
    seo_desc: "Get 30% back on your home battery installation via the federal ITC. Learn who qualifies, how to claim it, and which state incentives stack on top.",
    body_html: `<p>If you've been waiting for a good time to install a home battery system, 2025 may be the best year yet. The federal Investment Tax Credit (ITC) currently covers <strong>30% of the total cost</strong> of qualifying battery storage systems — and unlike past incentives, it no longer requires solar panels to be installed at the same time.</p>

<h2>What Is the Federal Battery Storage Tax Credit?</h2>
<p>The ITC for battery storage was expanded by the <strong>Inflation Reduction Act of 2022</strong>. Key provisions:</p>
<ul>
  <li><strong>Credit amount:</strong> 30% of total installed cost (hardware + labor + permitting)</li>
  <li><strong>Minimum battery size:</strong> 3 kWh capacity (all EcoPowerWall batteries qualify)</li>
  <li><strong>Solar required?</strong> No — standalone battery systems now qualify without solar</li>
  <li><strong>Expiration:</strong> 30% rate locked through 2032, then steps down to 26% (2033) and 22% (2034)</li>
  <li><strong>Credit type:</strong> Non-refundable — reduces your federal tax liability dollar-for-dollar</li>
</ul>

<h2>How Much Can You Save?</h2>
<p>Here are real-dollar examples based on typical EcoPowerWall installations:</p>
<table>
  <thead><tr><th>System</th><th>Estimated Installed Cost</th><th>30% ITC Value</th><th>Net Cost After Credit</th></tr></thead>
  <tbody>
    <tr><td><a href="/products/16kwh-battery">16 kWh Battery</a> + <a href="/products/10kw-inverter">10 kW Inverter</a></td><td>~$8,500</td><td>$2,550</td><td>~$5,950</td></tr>
    <tr><td><a href="/products/28kwh-battery">28.7 kWh Battery</a> + <a href="/products/12kw-inverter">12 kW Inverter</a></td><td>~$12,000</td><td>$3,600</td><td>~$8,400</td></tr>
    <tr><td>Full solar + storage system</td><td>~$25,000</td><td>$7,500</td><td>~$17,500</td></tr>
  </tbody>
</table>
<p><em>Note: Installed costs include equipment, labor, permits, and inspection. Consult a tax professional for your specific situation.</em></p>

<h2>Who Qualifies?</h2>
<p>To claim the credit, you must:</p>
<ul>
  <li>Be the owner of the property where the battery is installed (renters do not qualify)</li>
  <li>Install the system at your primary or secondary residence in the US</li>
  <li>Have sufficient federal tax liability to use the credit (it is non-refundable)</li>
  <li>Use a battery with at least 3 kWh of capacity (all EcoPowerWall batteries qualify)</li>
</ul>
<p>If your tax liability is less than the credit amount, you can carry the unused portion forward to future tax years.</p>

<h2>How to Claim the Credit</h2>
<ol>
  <li>Install your battery storage system and get a final invoice from your installer</li>
  <li>File <strong>IRS Form 5695</strong> (Residential Energy Credits) with your federal tax return</li>
  <li>Enter the total installed cost and calculate the 30% credit</li>
  <li>The credit reduces your tax bill dollar-for-dollar</li>
</ol>

<h2>State Incentives That Stack on Top</h2>
<p>Many states offer additional incentives that combine with the federal credit:</p>
<ul>
  <li><strong>California:</strong> SGIP (Self-Generation Incentive Program) — up to $200/kWh rebate for battery storage</li>
  <li><strong>New York:</strong> NY-Sun program includes battery incentives; Con Edison rebates available</li>
  <li><strong>Massachusetts:</strong> SMART program with storage adder; Green Communities incentives</li>
  <li><strong>Texas:</strong> Some utilities offer demand response incentives for battery storage</li>
  <li><strong>Hawaii:</strong> State tax credit on top of federal ITC</li>
</ul>
<p>Visit our <a href="/pages/incentives">full incentives page</a> for a complete state-by-state breakdown.</p>

<h2>Act Before 2033</h2>
<p>The 30% credit rate is guaranteed through 2032. Starting in 2033, it steps down to 26%, then 22% in 2034. The longer you wait, the smaller your credit. A $12,000 system bought in 2032 earns $3,600 back; the same system in 2034 earns only $2,640.</p>
<p>Ready to take advantage of the credit? <a href="/pages/contact">Contact our team</a> or <a href="/pages/help-me-choose">use our system selector</a> to find the right battery for your home.</p>`,
  },
  {
    title: "How Long Will a Home Battery Keep Your Lights On? (Real Numbers)",
    handle: "how-long-home-battery-backup-power",
    tags: "backup duration, outage, home battery, LiFePO4, 28.7 kwh",
    seo_title: "How Long Does a Home Battery Last During an Outage? | EcoPowerWall",
    seo_desc: "Find out exactly how long a 16 kWh or 28.7 kWh home battery will power your home. Real wattage numbers for every major appliance and load scenario.",
    body_html: `<p>The most common question before buying a home battery: <em>"How long will it actually keep my house powered?"</em> The honest answer is: it depends on what you're running. Here's a practical breakdown using real appliance wattages and both EcoPowerWall battery sizes.</p>

<h2>How to Calculate Backup Duration</h2>
<p>The formula is simple: <strong>Battery capacity (kWh) ÷ Load (kW) = Hours of backup</strong></p>
<p>For example: 28.7 kWh ÷ 2.0 kW load = 14.35 hours</p>
<p>The key variable is your load — which appliances you keep running during an outage.</p>

<h2>Common Appliance Wattages</h2>
<table>
  <thead><tr><th>Appliance</th><th>Running Watts</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Refrigerator</td><td>150W</td><td>Cycles on/off — avg ~150W</td></tr>
    <tr><td>Freezer (chest)</td><td>100W</td><td>Cycles on/off</td></tr>
    <tr><td>LED lighting (whole home)</td><td>100–200W</td><td>~10W per room, 10–20 rooms</td></tr>
    <tr><td>Wi-Fi router + modem</td><td>20W</td><td>—</td></tr>
    <tr><td>Laptop charging</td><td>65W</td><td>Per laptop</td></tr>
    <tr><td>Phone charging (×4)</td><td>40W</td><td>—</td></tr>
    <tr><td>TV (65" LED)</td><td>120W</td><td>—</td></tr>
    <tr><td>Ceiling fans (×4)</td><td>200W</td><td>50W each</td></tr>
    <tr><td>Sump pump</td><td>800W</td><td>Only when running</td></tr>
    <tr><td>Mini-split AC (1 zone)</td><td>900W</td><td>On high cooling</td></tr>
    <tr><td>Central AC (3-ton)</td><td>3,500W</td><td>On/off cycling</td></tr>
    <tr><td>Electric water heater</td><td>4,500W</td><td>Cycles on/off</td></tr>
    <tr><td>EV charger (Level 2)</td><td>7,200W</td><td>Continuous while charging</td></tr>
  </tbody>
</table>

<h2>Scenario 1: Essential Loads Only</h2>
<p>Fridge + freezer + lights + router + phones + fans = ~800W average</p>
<ul>
  <li><a href="/products/16kwh-battery"><strong>16 kWh battery</strong></a>: 16 ÷ 0.8 = <strong>20 hours</strong></li>
  <li><a href="/products/28kwh-battery"><strong>28.7 kWh battery</strong></a>: 28.7 ÷ 0.8 = <strong>35.9 hours</strong></li>
</ul>

<h2>Scenario 2: Essential Loads + One Mini-Split AC Zone</h2>
<p>Essential loads + mini-split = ~1,700W average</p>
<ul>
  <li><strong>16 kWh battery</strong>: 16 ÷ 1.7 = <strong>9.4 hours</strong></li>
  <li><strong>28.7 kWh battery</strong>: 28.7 ÷ 1.7 = <strong>16.9 hours</strong></li>
</ul>

<h2>Scenario 3: Whole Home Including Central AC</h2>
<p>Essential loads + central AC (average duty cycle) ≈ 3,500W average</p>
<ul>
  <li><strong>16 kWh battery</strong>: 16 ÷ 3.5 = <strong>4.6 hours</strong></li>
  <li><strong>28.7 kWh battery</strong>: 28.7 ÷ 3.5 = <strong>8.2 hours</strong></li>
</ul>

<h2>With Solar: Backup Duration Becomes Indefinite</h2>
<p>Add solar panels and the calculation changes fundamentally. Even a modest 6 kW solar array generates 24–36 kWh on a sunny day — fully recharging the 28.7 kWh battery every day. During an extended outage, the combination of a large battery and solar array can power your home indefinitely as long as the sun rises.</p>
<p>EcoPowerWall inverters include built-in MPPT solar charge controllers, so solar recharging happens automatically without any user intervention.</p>

<h2>Which Battery Is Right for Your Backup Goals?</h2>
<ul>
  <li>Occasional short outages (4–8 hrs), essential loads only → <a href="/products/16kwh-battery">16 kWh battery</a></li>
  <li>Multi-day outages or HVAC backup → <a href="/products/28kwh-battery">28.7 kWh battery</a></li>
  <li>Indefinite outage protection → 28.7 kWh battery + solar</li>
</ul>
<p>Use our <a href="/pages/sizing-guide">battery sizing guide</a> for a personalized calculation, or <a href="/pages/contact">contact our team</a> for a recommendation based on your specific loads.</p>`,
  },
];

async function publishNewArticles() {
  console.log("\n── New SEO blog articles ───────────────────────────────");
  for (const a of newArticles) {
    // Check if already exists
    const existing = await rest(`/blogs/${BLOG}/articles.json?handle=${a.handle}&fields=id,handle`);
    if (existing.articles?.length > 0) {
      console.log(`  skipped (exists): ${a.handle}`);
      continue;
    }

    const d = await rest(`/blogs/${BLOG}/articles.json`, "POST", {
      article: {
        title: a.title,
        handle: a.handle,
        body_html: a.body_html,
        tags: a.tags,
        published: true,
        metafields: [
          { namespace: "global", key: "title_tag",       value: a.seo_title, type: "single_line_text_field" },
          { namespace: "global", key: "description_tag", value: a.seo_desc,  type: "single_line_text_field" },
        ],
      },
    });
    if (d.article?.id) {
      console.log(`✓ published: ${d.article.title}`);
    } else {
      console.log(`✗ ${a.handle}:`, JSON.stringify(d.errors));
    }
  }
}

// ── 5. Article/BlogPosting schema snippet ────────────────────────────────────
async function addArticleSchema() {
  console.log("\n── Article schema snippet ──────────────────────────────");
  const schema = await getAsset("snippets/schema.liquid");

  const articleBlock = `
{%- if request.page_type == 'article' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "{{ canonical_url }}#article",
  "headline": {{ article.title | json }},
  "description": {{ article.excerpt_or_content | strip_html | truncate: 200 | json }},
  "url": "{{ canonical_url }}",
  "datePublished": "{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  "dateModified": "{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%z' }}",
  {%- if article.image -%}
  "image": "{{ article.image | image_url: width: 1200 }}",
  {%- endif -%}
  "publisher": {
    "@type": "Organization",
    "@id": "{{ shop.url }}/#organization",
    "name": {{ shop.name | json }},
    "url": "{{ shop.url }}"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ canonical_url }}"
  },
  "isPartOf": {
    "@type": "Blog",
    "name": {{ blog.title | json }},
    "url": "{{ shop.url }}/blogs/{{ blog.handle }}"
  },
  "keywords": {{ article.tags | join: ', ' | json }}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ shop.url }}" },
    { "@type": "ListItem", "position": 2, "name": {{ blog.title | json }}, "item": "{{ shop.url }}/blogs/{{ blog.handle }}" },
    { "@type": "ListItem", "position": 3, "name": {{ article.title | json }}, "item": "{{ canonical_url }}" }
  ]
}
</script>
{%- endif -%}
`;

  if (schema.includes("BlogPosting")) {
    console.log("  skipped — BlogPosting schema already present");
    return;
  }

  // Append before the first {%- if request.page_type == 'product' -%} block
  const updated = schema.replace(
    "{%- if request.page_type == 'product' -%}",
    articleBlock.trimStart() + "{%- if request.page_type == 'product' -%}"
  );
  console.log(await putAsset("snippets/schema.liquid", updated));
}

// ── 6. Upgrade Organization schema with sameAs & OnlineStore type ────────────
async function upgradeOrganizationSchema() {
  console.log("\n── Upgrade Organization schema ─────────────────────────");
  const schema = await getAsset("snippets/schema.liquid");

  const oldOrg = `    {
      "@type": "Organization",
      "@id": "{{ shop.url }}/#organization",
      "name": {{ shop.name | json }},
      "url": "{{ shop.url }}"
    },`;

  const newOrg = `    {
      "@type": ["Organization", "Store"],
      "@id": "{{ shop.url }}/#organization",
      "name": {{ shop.name | json }},
      "url": "{{ shop.url }}",
      "logo": "{{ shop.url }}/cdn/shop/t/${THEME}/assets/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "{{ shop.url }}/pages/contact"
      },
      "sameAs": [
        "https://www.facebook.com/ecopowerwall",
        "https://www.instagram.com/ecopowerwall",
        "https://www.youtube.com/@ecopowerwall"
      ]
    },`;

  if (schema.includes('"Store"')) {
    console.log("  skipped — Store type already present");
    return;
  }

  if (!schema.includes(oldOrg.trim().split("\n")[1].trim())) {
    console.log("  anchor not found");
    return;
  }

  const updated = schema.replace(oldOrg, newOrg);
  console.log(await putAsset("snippets/schema.liquid", updated));
}

(async () => {
  await createRedirects();
  await updateExistingArticleSEO();
  await expandArticles();
  await publishNewArticles();
  await addArticleSchema();
  await upgradeOrganizationSchema();
  console.log("\nPhase 6 complete.");
})();
