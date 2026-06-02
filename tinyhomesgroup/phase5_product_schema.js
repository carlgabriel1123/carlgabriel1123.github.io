const AUTH = "donna:ytbc 5vov zrnk TQ9x UTj6 cclg";
const BASE = "https://tinyhomesgroup.com/wp-json/aioseo/v1/post";
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Basic " + Buffer.from(AUTH).toString("base64"),
};

const cabins = [
  {
    id: 2244,
    name: "40FT Modular Cabin",
    description: "Our 40ft modular cabin is a fully expandable tiny home designed for comfortable off-grid or on-grid living. Features high-quality construction, energy-efficient design, and fast delivery across the USA.",
    url: "https://tinyhomesgroup.com/40ft-modular-cabin/",
  },
  {
    id: 2230,
    name: "30FT Modular Cabin",
    description: "The 30ft modular cabin offers the perfect balance of space and affordability. A fully equipped expandable tiny home built for permanent residence, vacation retreat, or rental property.",
    url: "https://tinyhomesgroup.com/30ft-modular-cabin/",
  },
  {
    id: 2142,
    name: "20FT Modular Cabin",
    description: "Compact and affordable, our 20ft modular cabin is an ideal expandable tiny home for single occupancy, guest house, or starter home. High-quality finishes with fast USA delivery.",
    url: "https://tinyhomesgroup.com/20ft-modular-cabin/",
  },
  {
    id: 2513,
    name: "10FT Modular Cabin",
    description: "The 10ft modular cabin is our most compact expandable tiny home — perfect as a studio, home office, or private retreat. Minimal footprint with maximum livability.",
    url: "https://tinyhomesgroup.com/10ft-modular-cabin-tiny-homes-for-sale/",
  },
  {
    id: 1887,
    name: "A-Frame Tiny Home",
    description: "The iconic A-Frame tiny home by Tiny Homes Group. Stunning architectural design with a steeply pitched roof, open interior, and energy-efficient construction for mountain and nature retreats.",
    url: "https://tinyhomesgroup.com/a-frame/",
  },
  {
    id: 1963,
    name: "Dome Tiny Home",
    description: "Our geodesic dome tiny home offers a unique, structurally superior living space. Ideal for glamping, off-grid living, or eco-retreats. Available in multiple sizes with full customization.",
    url: "https://tinyhomesgroup.com/domes/",
  },
  {
    id: 2194,
    name: "Space Pod Tiny Home",
    description: "The Space Pod is a futuristic modular tiny home with a sleek oval design. Built for modern off-grid living, glamping resorts, and boutique hospitality properties.",
    url: "https://tinyhomesgroup.com/space-pod/",
  },
  {
    id: 2578,
    name: "20ft Magic Container House",
    description: "Our 20ft Magic Container House transforms a standard shipping container into a fully functional living space. Affordable, durable, and delivered fast across the USA.",
    url: "https://tinyhomesgroup.com/20ft-magic-container-house/",
  },
  {
    id: 2607,
    name: "40ft Magic Container House",
    description: "The 40ft Magic Container House provides spacious container living with premium finishes. Ideal as a primary residence, vacation home, or rental property. Fast USA delivery available.",
    url: "https://tinyhomesgroup.com/40ft-magic-container-house/",
  },
  {
    id: 2643,
    name: "Converted Container Home",
    description: "Our Converted Container Home repurposes heavy-duty shipping containers into modern, sustainable living spaces. Custom interiors, energy-efficient builds, and nationwide USA delivery.",
    url: "https://tinyhomesgroup.com/converted-container/",
  },
  {
    id: 2000,
    name: "Outdoor Luxury Resort Lodge Tent",
    description: "The Outdoor Luxury Resort Lodge Tent by Tiny Homes Group is purpose-built for glamping, eco-resorts, and boutique hospitality. Permanent-grade construction with premium lodge aesthetics.",
    url: "https://tinyhomesgroup.com/outdoor-luxury-resort-lodge-hotel-tent/",
  },
  {
    id: 2719,
    name: "40ft Custom-Built Luxury Prefab Apple Cabin",
    description: "The 40ft Apple Cabin is a custom-built luxury prefab home inspired by mountain chalet architecture. Premium materials, full customization options, and delivered ready to install across the USA.",
    url: "https://tinyhomesgroup.com/40ft-custom-built-luxury-prefab-apple-cabin/",
  },
  {
    id: 2701,
    name: "20ft Custom-Built Luxury Prefab Apple Cabin",
    description: "The 20ft Apple Cabin is a compact luxury prefab home with premium finishes and custom build options. Ideal as a vacation retreat, guest house, or permanent tiny home.",
    url: "https://tinyhomesgroup.com/20ft-custom-built-luxury-prefab-apple-cabin/",
  },
];

async function updateProductSchema(cabin) {
  const productEntry = {
    id: `aioseo-schema-product-${cabin.id}`,
    name: cabin.name,
    description: cabin.description,
    image: "",
    brand: "Tiny Homes Group",
    sku: "",
    identifier: { type: "none", value: "" },
    reviews: [],
    rating: { minimum: 1, maximum: 5, value: "" },
    reviewCount: "",
    offers: {
      type: "Offer",
      currency: "USD",
      price: "",
      validUntil: "",
      url: cabin.url,
      availability: "instock",
      condition: "new",
    },
  };

  const body = JSON.stringify({
    id: cabin.id,
    schema: {
      default: {
        isEnabled: true,
        graphName: "Product",
        data: {
          Product: [productEntry],
        },
      },
    },
  });

  const res = await fetch(BASE, { method: "POST", headers, body });
  const json = await res.json();
  if (json.success) {
    console.log(`✓ [${cabin.id}] ${cabin.name}`);
  } else {
    console.log(`✗ [${cabin.id}] ${cabin.name}:`, JSON.stringify(json));
  }
}

(async () => {
  // Test on first cabin only
  await updateProductSchema(cabins[0]);
})();
