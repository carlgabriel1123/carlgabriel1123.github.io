const AUTH = Buffer.from("donna:ytbc 5vov zrnk TQ9x UTj6 cclg").toString("base64");
const HEADERS = { "Authorization": `Basic ${AUTH}`, "Content-Type": "application/json" };
const RM_URL = "https://tinyhomesgroup.com/wp-json/rankmath/v1/updateMeta";
const WP_URL = "https://tinyhomesgroup.com/wp-json/wp/v2/pages";

// Skip 2230 (already done) and 2244 (broken - needs manual fix)
const cabins = [
  { id: 2142, name: "20FT Modular Cabin",                          price: "32500" },
  { id: 2513, name: "10FT Modular Cabin",                          price: "27500" },
  { id: 1887, name: "A-Frame Tiny Home",                           price: null    },
  { id: 1963, name: "Dome Tiny Home",                              price: "7500"  },
  { id: 2194, name: "Space Pod Tiny Home",                         price: "7500"  },
  { id: 2578, name: "20ft Magic Container House",                  price: "75000" },
  { id: 2607, name: "40ft Magic Container House",                  price: "120000"},
  { id: 2643, name: "Converted Container Home",                    price: "68500" },
  { id: 2000, name: "Outdoor Luxury Resort Lodge Tent",            price: "8500"  },
  { id: 2719, name: "40ft Custom-Built Luxury Prefab Apple Cabin", price: "30146" },
  { id: 2701, name: "20ft Custom-Built Luxury Prefab Apple Cabin", price: "30146" },
];

async function applySchema(cabin) {
  const meta = {
    rank_math_rich_snippet: "product",
    rank_math_snippet_product_brand: "Tiny Homes Group",
    rank_math_snippet_product_instock: "on",
    rank_math_snippet_product_condition: "https://schema.org/NewCondition",
  };
  if (cabin.price) {
    meta.rank_math_snippet_product_currency = "USD";
    meta.rank_math_snippet_product_price = cabin.price;
  }

  const r = await fetch(RM_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ objectType: "post", objectID: cabin.id, meta }),
  });
  const json = await r.json();

  // Touch post to bust cache
  await fetch(`${WP_URL}/${cabin.id}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ status: "publish" }),
  });

  if (json.slug !== undefined) {
    console.log(`✓ [${cabin.id}] ${cabin.name}`);
  } else {
    console.log(`✗ [${cabin.id}] ${cabin.name}:`, JSON.stringify(json).substring(0, 100));
  }
}

(async () => {
  for (const cabin of cabins) {
    await applySchema(cabin);
  }
  console.log("\nDone — 11 pages updated with Product schema type.");
})();
