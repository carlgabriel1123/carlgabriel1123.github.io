const AUTH = Buffer.from("donna:ytbc 5vov zrnk TQ9x UTj6 cclg").toString("base64");
const HEADERS = {
  "Authorization": `Basic ${AUTH}`,
  "Content-Type": "application/json",
};
const BASE = "https://tinyhomesgroup.com/wp-json/wp/v2/pages";

const cabins = [
  { id: 2244, name: "40FT Modular Cabin",                       price: null,    url: "https://tinyhomesgroup.com/40ft-modular-cabin/" },
  { id: 2230, name: "30FT Modular Cabin",                       price: "39800", url: "https://tinyhomesgroup.com/30ft-modular-cabin/" },
  { id: 2142, name: "20FT Modular Cabin",                       price: "32500", url: "https://tinyhomesgroup.com/20ft-modular-cabin/" },
  { id: 2513, name: "10FT Modular Cabin",                       price: "27500", url: "https://tinyhomesgroup.com/10ft-modular-cabin-tiny-homes-for-sale/" },
  { id: 1887, name: "A-Frame Tiny Home",                        price: null,    url: "https://tinyhomesgroup.com/a-frame/" },
  { id: 1963, name: "Dome Tiny Home",                           price: "7500",  url: "https://tinyhomesgroup.com/domes/" },
  { id: 2194, name: "Space Pod Tiny Home",                      price: "7500",  url: "https://tinyhomesgroup.com/space-pod/" },
  { id: 2578, name: "20ft Magic Container House",               price: "75000", url: "https://tinyhomesgroup.com/20ft-magic-container-house/" },
  { id: 2607, name: "40ft Magic Container House",               price: "120000",url: "https://tinyhomesgroup.com/40ft-magic-container-house/" },
  { id: 2643, name: "Converted Container Home",                 price: "68500", url: "https://tinyhomesgroup.com/converted-container/" },
  { id: 2000, name: "Outdoor Luxury Resort Lodge Tent",         price: "8500",  url: "https://tinyhomesgroup.com/outdoor-luxury-resort-lodge-hotel-tent/" },
  { id: 2719, name: "40ft Custom-Built Luxury Prefab Apple Cabin", price: "30146", url: "https://tinyhomesgroup.com/40ft-custom-built-luxury-prefab-apple-cabin/" },
  { id: 2701, name: "20ft Custom-Built Luxury Prefab Apple Cabin", price: "30146", url: "https://tinyhomesgroup.com/20ft-custom-built-luxury-prefab-apple-cabin/" },
];

const descriptions = {
  2244: "Our 40ft modular cabin is a fully expandable tiny home designed for comfortable off-grid or on-grid living. Features high-quality construction, energy-efficient design, and fast delivery across the USA.",
  2230: "The 30ft modular cabin offers the perfect balance of space and affordability. A fully equipped expandable tiny home built for permanent residence, vacation retreat, or rental property.",
  2142: "Compact and affordable, our 20ft modular cabin is an ideal expandable tiny home for single occupancy, guest house, or starter home. High-quality finishes with fast USA delivery.",
  2513: "The 10ft modular cabin is our most compact expandable tiny home — perfect as a studio, home office, or private retreat. Minimal footprint with maximum livability.",
  1887: "The iconic A-Frame tiny home by Tiny Homes Group. Stunning architectural design with a steeply pitched roof, open interior, and energy-efficient construction for mountain and nature retreats.",
  1963: "Our geodesic dome tiny home offers a unique, structurally superior living space. Ideal for glamping, off-grid living, or eco-retreats. Available in multiple sizes with full customization.",
  2194: "The Space Pod is a futuristic modular tiny home with a sleek oval design. Built for modern off-grid living, glamping resorts, and boutique hospitality properties.",
  2578: "Our 20ft Magic Container House transforms a standard shipping container into a fully functional living space. Affordable, durable, and delivered fast across the USA.",
  2607: "The 40ft Magic Container House provides spacious container living with premium finishes. Ideal as a primary residence, vacation home, or rental property. Fast USA delivery available.",
  2643: "Our Converted Container Home repurposes heavy-duty shipping containers into modern, sustainable living spaces. Custom interiors, energy-efficient builds, and nationwide USA delivery.",
  2000: "The Outdoor Luxury Resort Lodge Tent by Tiny Homes Group is purpose-built for glamping, eco-resorts, and boutique hospitality. Permanent-grade construction with premium lodge aesthetics.",
  2719: "The 40ft Apple Cabin is a custom-built luxury prefab home inspired by mountain chalet architecture. Premium materials, full customization options, and delivered ready to install across the USA.",
  2701: "The 20ft Apple Cabin is a compact luxury prefab home with premium finishes and custom build options. Ideal as a vacation retreat, guest house, or permanent tiny home.",
};

function buildSchema(cabin) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": cabin.name,
    "description": descriptions[cabin.id],
    "brand": { "@type": "Organization", "name": "Tiny Homes Group" },
    "url": cabin.url,
    "category": "Modular Homes & Tiny Houses",
  };
  if (cabin.price) {
    schema.offers = {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": cabin.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "url": cabin.url,
    };
  }
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

async function processPage(cabin) {
  // Get raw content
  const getRes = await fetch(`${BASE}/${cabin.id}?context=edit&_fields=content`, {
    headers: { Authorization: `Basic ${AUTH}` },
  });
  const page = await getRes.json();
  const raw = page.content?.raw || "";

  // Skip if Product schema already injected
  if (raw.includes('"@type": "Product"') || raw.includes('"@type":"Product"')) {
    console.log(`SKIP [${cabin.id}] ${cabin.name} — already has Product schema`);
    return;
  }

  // Prepend schema block
  const newContent = buildSchema(cabin) + "\n" + raw;

  // PATCH the page
  const patchRes = await fetch(`${BASE}/${cabin.id}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ content: newContent }),
  });
  const result = await patchRes.json();
  if (result.id) {
    console.log(`✓ [${cabin.id}] ${cabin.name}`);
  } else {
    console.log(`✗ [${cabin.id}] ${cabin.name}:`, JSON.stringify(result).substring(0, 200));
  }
}

(async () => {
  for (const cabin of cabins) {
    await processPage(cabin);
  }
  console.log("\nDone. All cabin pages updated.");
})();
