const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "aividk-yk.myshopify.com";

async function gql(query, variables = {}) {
  const r = await fetch(`https://${STORE}/admin/api/2024-01/graphql.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

// ── Products ─────────────────────────────────────────────────────────────────
const products = [
  {
    id: "gid://shopify/Product/9692163113190",
    seo: {
      title: "16 kWh LiFePO4 Home Battery | EcoPowerWall",
      description: "Store solar energy and power your home through outages with the EcoPowerWall 16 kWh LiFePO4 battery. 6,000+ cycle lifespan, 5-year warranty, and seamless inverter integration.",
    },
  },
  {
    id: "gid://shopify/Product/9692163145958",
    seo: {
      title: "28.7 kWh LiFePO4 Home Battery — Flagship | EcoPowerWall",
      description: "The EcoPowerWall 28.7 kWh flagship battery delivers 24+ hours of whole-home backup. Best value per kWh, 10-year warranty, compatible with any hybrid inverter.",
    },
  },
  {
    id: "gid://shopify/Product/9692163047654",
    seo: {
      title: "10 kW Pure Sine Wave Inverter | EcoPowerWall",
      description: "The EcoPowerWall 10 kW pure sine wave inverter handles solar, battery, and grid input seamlessly. Supports up to 8 kW solar with built-in MPPT charger for whole-home backup.",
    },
  },
  {
    id: "gid://shopify/Product/9692163080422",
    seo: {
      title: "12 kW Pure Sine Wave Inverter | EcoPowerWall",
      description: "Power heavy loads — EV charging, central A/C, and full home appliances — with the EcoPowerWall 12 kW pure sine wave inverter. Built-in MPPT and hybrid solar-battery-grid management.",
    },
  },
];

// ── Collections ──────────────────────────────────────────────────────────────
const collections = [
  {
    id: "gid://shopify/Collection/488452489446",
    seo: {
      title: "LiFePO4 Home Batteries | EcoPowerWall",
      description: "Shop EcoPowerWall LiFePO4 home battery storage systems. Choose from 16 kWh and 28.7 kWh options for solar storage, backup power, and off-grid energy independence.",
    },
  },
  {
    id: "gid://shopify/Collection/488452194534",
    seo: {
      title: "Pure Sine Wave Home Inverters | EcoPowerWall",
      description: "Shop EcoPowerWall 10 kW and 12 kW pure sine wave inverters. Compatible with LiFePO4 batteries and solar panels with built-in MPPT and whole-home backup capability.",
    },
  },
  {
    id: "gid://shopify/Collection/488453210342",
    seo: {
      title: "Home Energy System Bundles & Kits | EcoPowerWall",
      description: "Complete battery and inverter bundles for whole-home energy storage. Matched EcoPowerWall components in one package for simplified purchasing and installation.",
    },
  },
  {
    id: "gid://shopify/Collection/488452817126",
    seo: {
      title: "Battery & Inverter Accessories | EcoPowerWall",
      description: "Shop EcoPowerWall accessories: cables, connectors, breakers, mounting hardware, and monitoring equipment for a complete home energy system installation.",
    },
  },
  {
    id: "gid://shopify/Collection/488453636326",
    seo: {
      title: "Best Selling Home Energy Products | EcoPowerWall",
      description: "Shop EcoPowerWall's most trusted home batteries and inverters. Top-rated products for solar storage, backup power, and energy independence across the USA.",
    },
  },
  {
    id: "gid://shopify/Collection/488453767398",
    seo: {
      title: "New Home Energy Products | EcoPowerWall",
      description: "Discover the latest home batteries, inverters, and energy system accessories from EcoPowerWall. New products added regularly for solar storage and backup power.",
    },
  },
  {
    id: "gid://shopify/Collection/488454160614",
    seo: {
      title: "Home Energy System Deals & Clearance | EcoPowerWall",
      description: "Shop discounted EcoPowerWall home batteries, inverters, and accessories. Limited clearance stock at reduced prices on premium energy storage equipment.",
    },
  },
  {
    id: "gid://shopify/Collection/488454979814",
    seo: {
      title: "Solar Panels for Home Energy Systems | EcoPowerWall",
      description: "Shop solar panels compatible with EcoPowerWall batteries and inverters. High-efficiency panels for maximum solar generation and whole-home energy storage.",
    },
  },
  {
    id: "gid://shopify/Collection/488455209190",
    seo: {
      title: "EV Chargers — Charge from Solar & Battery | EcoPowerWall",
      description: "Shop EV chargers compatible with EcoPowerWall home energy systems. Charge your electric vehicle from solar power and battery storage for zero-cost driving.",
    },
  },
  {
    id: "gid://shopify/Collection/488455504102",
    seo: {
      title: "Battery & Inverter Cables and Connectors | EcoPowerWall",
      description: "Shop high-quality solar cables, battery cables, and MC4 connectors for EcoPowerWall systems. Safety-rated wiring for reliable home energy system connections.",
    },
  },
  {
    id: "gid://shopify/Collection/488455700710",
    seo: {
      title: "Circuit Breakers for Home Energy Systems | EcoPowerWall",
      description: "Shop circuit breakers and disconnect switches for EcoPowerWall battery and inverter installations. Safety-rated for solar, battery, and grid connection points.",
    },
  },
  {
    id: "gid://shopify/Collection/488455831782",
    seo: {
      title: "Home Energy Monitoring Systems | EcoPowerWall",
      description: "Track solar generation, battery levels, and home energy usage with EcoPowerWall monitoring equipment. Real-time data for smarter energy management.",
    },
  },
  {
    id: "gid://shopify/Collection/488456224998",
    seo: {
      title: "Battery & Inverter Mounting Hardware | EcoPowerWall",
      description: "Shop mounting brackets, racks, and hardware for EcoPowerWall batteries and inverters. Wall-mount and floor-mount options for safe, professional installations.",
    },
  },
];

// ── Pages (via metafieldsSet — global.title_tag / global.description_tag) ────
const pages = [
  {
    id: "gid://shopify/Page/119740334310",
    title: "About EcoPowerWall — Home Battery Storage Experts",
    description: "EcoPowerWall provides high-performance LiFePO4 home batteries and pure sine wave inverters for homeowners seeking energy independence, solar storage, and backup power.",
  },
  // Contact already done as test — updating here too to keep consistent
  {
    id: "gid://shopify/Page/119687741670",
    title: "Contact EcoPowerWall — Home Battery & Inverter Support",
    description: "Get in touch with EcoPowerWall. We're here to help with questions about our LiFePO4 home batteries, pure sine wave inverters, and solar energy systems.",
  },
  {
    id: "gid://shopify/Page/119740367078",
    title: "Home Battery & Inverter FAQs | EcoPowerWall",
    description: "Answers to common questions about EcoPowerWall LiFePO4 batteries, pure sine wave inverters, solar integration, installation, warranties, and federal tax credits.",
  },
  {
    id: "gid://shopify/Page/126617256166",
    title: "Home Backup Power Systems | EcoPowerWall",
    description: "Protect your home from power outages with EcoPowerWall battery backup systems. Keep lights, appliances, and critical loads running with LiFePO4 battery and inverter kits.",
  },
  {
    id: "gid://shopify/Page/126617387238",
    title: "Business Backup Power Systems | EcoPowerWall",
    description: "Keep your business running during outages with EcoPowerWall commercial battery backup. Scalable LiFePO4 storage and pure sine wave inverters for any business size.",
  },
  {
    id: "gid://shopify/Page/126617452774",
    title: "Off-Grid Home Energy Systems | EcoPowerWall",
    description: "Achieve complete energy independence with EcoPowerWall off-grid battery and inverter systems. Store solar energy and power your home 24/7 without grid connection.",
  },
  {
    id: "gid://shopify/Page/126617485542",
    title: "On-Grid Solar Battery Storage | EcoPowerWall",
    description: "Maximize your solar investment with EcoPowerWall on-grid battery storage. Reduce electricity bills and keep backup power available when the grid goes down.",
  },
  {
    id: "gid://shopify/Page/126617518310",
    title: "Hybrid Solar + Battery Energy Systems | EcoPowerWall",
    description: "EcoPowerWall hybrid systems combine solar, battery storage, and grid power for automatic switching. Power your home at the lowest cost with seamless energy management.",
  },
  {
    id: "gid://shopify/Page/126617551078",
    title: "Which EcoPowerWall System Is Right for You?",
    description: "Compare EcoPowerWall batteries and inverters to find the right system for your home. Use our sizing tool to match your energy use with the right battery capacity.",
  },
  {
    id: "gid://shopify/Page/126617583846",
    title: "How EcoPowerWall Home Energy Systems Work",
    description: "Learn how EcoPowerWall LiFePO4 batteries, pure sine wave inverters, and solar integration work together to store energy, provide backup power, and cut electricity costs.",
  },
  {
    id: "gid://shopify/Page/126617616614",
    title: "EcoPowerWall System Overview — Battery + Inverter",
    description: "Complete overview of EcoPowerWall home energy system components: LiFePO4 batteries, hybrid inverters, solar connections, and smart monitoring for whole-home power.",
  },
  {
    id: "gid://shopify/Page/126617649382",
    title: "Home Battery System Sizing Guide | EcoPowerWall",
    description: "Calculate the battery storage and inverter capacity you need. Use EcoPowerWall's sizing guide to choose between the 16 kWh and 28.7 kWh batteries for your home.",
  },
  {
    id: "gid://shopify/Page/126617682150",
    title: "Home Battery Installation Process | EcoPowerWall",
    description: "Step-by-step overview of EcoPowerWall battery and inverter installation. From site assessment to system commissioning — what to expect working with a licensed electrician.",
  },
  {
    id: "gid://shopify/Page/126617714918",
    title: "Battery & Inverter Compatibility Guide | EcoPowerWall",
    description: "Verify compatibility between EcoPowerWall batteries, inverters, and solar panels. Ensure your system components work together safely for optimized performance.",
  },
  {
    id: "gid://shopify/Page/126617747686",
    title: "Solar & Battery Tax Credits and Incentives | EcoPowerWall",
    description: "Find federal and state incentives for EcoPowerWall home battery and solar systems. Discover how to claim the 30% ITC and additional state rebates to reduce your costs.",
  },
  {
    id: "gid://shopify/Page/126617780454",
    title: "EcoPowerWall Technical Support & Help Center",
    description: "Get technical support for EcoPowerWall home batteries and inverters. Access manuals, troubleshooting guides, and contact our support team for expert assistance.",
  },
  {
    id: "gid://shopify/Page/126617845990",
    title: "Battery & Inverter Manuals and Datasheets | EcoPowerWall",
    description: "Download technical manuals, specification sheets, and installation guides for EcoPowerWall LiFePO4 batteries and pure sine wave inverters.",
  },
  {
    id: "gid://shopify/Page/126617944294",
    title: "EcoPowerWall Warranty Coverage | Battery & Inverter",
    description: "Understand EcoPowerWall warranty terms: 10-year on the 28.7 kWh battery, 5-year on the 16 kWh, and 2-year on inverters. Coverage for defects and capacity retention.",
  },
  {
    id: "gid://shopify/Page/126618140902",
    title: "EcoPowerWall Customer Reviews & Testimonials",
    description: "Read verified reviews of EcoPowerWall home batteries and inverters. Real experiences from homeowners who have achieved energy independence and backup power.",
  },
  {
    id: "gid://shopify/Page/119740432614",
    title: "Shipping Policy | EcoPowerWall",
    description: "EcoPowerWall shipping policy for home batteries and inverters. Free freight shipping on all orders across the USA with estimated delivery timelines.",
  },
  {
    id: "gid://shopify/Page/119740399846",
    title: "Return Policy | EcoPowerWall",
    description: "Review EcoPowerWall's return and refund policy. Learn about our return window, conditions, and how to start a return for home batteries and inverters.",
  },
  {
    id: "gid://shopify/Page/119740465382",
    title: "Terms and Conditions | EcoPowerWall",
    description: "EcoPowerWall terms and conditions governing the purchase, use, and warranty of our home battery and inverter products.",
  },
  {
    id: "gid://shopify/Page/126618861798",
    title: "Privacy Policy | EcoPowerWall",
    description: "Read how EcoPowerWall collects, uses, and protects your personal information. We are committed to your privacy and data security.",
  },
];

// ── Runners ───────────────────────────────────────────────────────────────────
async function updateProducts() {
  console.log("\n── Products ──────────────────────────");
  for (const p of products) {
    const { data, errors } = await gql(`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id seo { title description } }
          userErrors { field message }
        }
      }
    `, { input: { id: p.id, seo: p.seo } });
    if (errors) { console.log(`✗ ${p.id}:`, errors); continue; }
    const ue = data.productUpdate.userErrors;
    if (ue.length) { console.log(`✗ ${p.id}:`, ue); continue; }
    console.log(`✓ ${data.productUpdate.product.seo.title}`);
  }
}

async function updateCollections() {
  console.log("\n── Collections ────────────────────────");
  for (const c of collections) {
    const { data, errors } = await gql(`
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection { id seo { title description } }
          userErrors { field message }
        }
      }
    `, { input: { id: c.id, seo: c.seo } });
    if (errors) { console.log(`✗ ${c.id}:`, errors); continue; }
    const ue = data.collectionUpdate.userErrors;
    if (ue.length) { console.log(`✗ ${c.id}:`, ue); continue; }
    console.log(`✓ ${data.collectionUpdate.collection.seo.title}`);
  }
}

async function updatePages() {
  console.log("\n── Pages ──────────────────────────────");
  for (const p of pages) {
    const { data, errors } = await gql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { namespace key value }
          userErrors { field message }
        }
      }
    `, {
      metafields: [
        { ownerId: p.id, namespace: "global", key: "title_tag",       value: p.title,       type: "single_line_text_field" },
        { ownerId: p.id, namespace: "global", key: "description_tag", value: p.description, type: "single_line_text_field" },
      ],
    });
    if (errors) { console.log(`✗ ${p.id}:`, errors); continue; }
    const ue = data.metafieldsSet.userErrors;
    if (ue.length) { console.log(`✗ ${p.id}:`, ue); continue; }
    console.log(`✓ ${p.title}`);
  }
}

(async () => {
  await updateProducts();
  await updateCollections();
  await updatePages();
  console.log("\nPhase 3 complete.");
})();
