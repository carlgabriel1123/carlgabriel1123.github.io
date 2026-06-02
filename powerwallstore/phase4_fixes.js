const TOKEN = process.env.SHOPIFY_TOKEN;
const STORE = "aividk-yk.myshopify.com";
const THEME = "157788668134";

async function getAsset(key) {
  const r = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${key}`,
    { headers: { "X-Shopify-Access-Token": TOKEN } }
  );
  const d = await r.json();
  return d.asset?.value || "";
}

async function putAsset(key, value) {
  const r = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json`,
    {
      method: "PUT",
      headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ asset: { key, value } }),
    }
  );
  const d = await r.json();
  return d.asset ? `✓ saved ${key}` : `✗ ${key}: ${JSON.stringify(d.errors)}`;
}

// ── 1. Fix theme.liquid <title> tag ──────────────────────────────────────────
async function fixThemeTitle() {
  const theme = await getAsset("layout/theme.liquid");

  const oldTitle = `  <title>
    {%- if page_title == shop.name -%}
      {{ shop.name }}
    {%- else -%}
      {{ page_title }} | {{ shop.name }}
    {%- endif -%}
  </title>`;

  const newTitle = `  <title>
    {%- if request.page_type == 'index' -%}
      EcoPowerWall — LiFePO4 Home Batteries &amp; Pure Sine Wave Inverters
    {%- elsif page_title contains '|' -%}
      {{ page_title }}
    {%- elsif page_title != shop.name -%}
      {{ page_title }} | {{ shop.name }}
    {%- else -%}
      {{ shop.name }}
    {%- endif -%}
  </title>`;

  if (!theme.includes(oldTitle.trim().split('\n')[1].trim())) {
    console.log("✗ theme.liquid title section not found as expected, dumping snippet:");
    const ti = theme.indexOf("<title>");
    console.log(theme.substring(ti, ti + 200));
    return;
  }

  const updated = theme.replace(oldTitle, newTitle);
  console.log(await putAsset("layout/theme.liquid", updated));
}

// ── 2. Fix seo.liquid — og_title + collection OG image ───────────────────────
const newSeoLiquid = `{%- comment -%} SEO meta tags — canonical, OG, Twitter {%- endcomment -%}
<link rel="canonical" href="{{ canonical_url }}">

{%- if page_image -%}
  <meta property="og:image" content="{{ page_image | image_url: width: 1200 }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="{{ page_image | image_url: width: 1200 }}">
{%- elsif request.page_type == 'product' and product.featured_image -%}
  <meta property="og:image" content="{{ product.featured_image | image_url: width: 1200 }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="{{ product.featured_image | image_url: width: 1200 }}">
{%- elsif request.page_type == 'collection' and collection.image -%}
  <meta property="og:image" content="{{ collection.image | image_url: width: 1200 }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="{{ collection.image | image_url: width: 1200 }}">
{%- elsif settings.og_image_default != blank -%}
  <meta property="og:image" content="{{ settings.og_image_default | image_url: width: 1200 }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="{{ settings.og_image_default | image_url: width: 1200 }}">
{%- endif -%}

{%- if request.page_type == 'index' -%}
  {%- assign og_title = 'EcoPowerWall — LiFePO4 Home Batteries & Pure Sine Wave Inverters' -%}
{%- elsif page_title contains '|' -%}
  {%- assign og_title = page_title -%}
{%- elsif page_title != shop.name -%}
  {%- assign og_title = page_title | append: ' | ' | append: shop.name -%}
{%- else -%}
  {%- assign og_title = shop.name -%}
{%- endif -%}

{%- if page_description -%}
  {%- assign og_desc = page_description -%}
{%- elsif request.page_type == 'product' and product.description != blank -%}
  {%- assign og_desc = product.description | strip_html | truncate: 155 -%}
{%- elsif request.page_type == 'collection' and collection.description != blank -%}
  {%- assign og_desc = collection.description | strip_html | truncate: 155 -%}
{%- else -%}
  {%- assign og_desc = settings.meta_description_default -%}
{%- endif -%}

<meta property="og:title" content="{{ og_title | escape }}">
<meta property="og:description" content="{{ og_desc | escape }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:site_name" content="{{ shop.name | escape }}">
{%- if request.page_type == 'product' -%}
  <meta property="og:type" content="product">
  <meta property="product:price:amount" content="{{ product.selected_or_first_available_variant.price | money_without_currency | remove: ',' }}">
  <meta property="product:price:currency" content="{{ cart.currency.iso_code }}">
{%- else -%}
  <meta property="og:type" content="website">
{%- endif -%}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ og_title | escape }}">
<meta name="twitter:description" content="{{ og_desc | escape }}">
`;

// ── 3. Fix schema.liquid — add BreadcrumbList for page type ──────────────────
const newSchemaLiquid = `{%- comment -%} JSON-LD Structured Data {%- endcomment -%}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "{{ shop.url }}/#organization",
      "name": {{ shop.name | json }},
      "url": "{{ shop.url }}"
    },
    {
      "@type": "WebSite",
      "@id": "{{ shop.url }}/#website",
      "url": "{{ shop.url }}",
      "name": {{ shop.name | json }},
      "publisher": { "@id": "{{ shop.url }}/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "{{ shop.url }}/search?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
</script>

{%- if request.page_type == 'product' -%}
  {%- assign v = product.selected_or_first_available_variant -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "{{ shop.url }}/products/{{ product.handle }}#product",
  "name": {{ product.title | json }},
  "description": {{ product.description | strip_html | truncate: 500 | json }},
  "url": "{{ shop.url }}/products/{{ product.handle }}",
  {%- if product.featured_image -%}
  "image": "{{ product.featured_image | image_url: width: 1200 }}",
  {%- endif -%}
  "sku": {{ v.sku | default: product.handle | json }},
  "brand": { "@type": "Brand", "name": "EcoPowerWall" },
  "offers": {
    "@type": "Offer",
    "url": "{{ shop.url }}/products/{{ product.handle }}",
    "priceCurrency": {{ cart.currency.iso_code | json }},
    "price": "{{ v.price | money_without_currency | remove: ',' }}",
    "availability": {%- if v.available -%}"https://schema.org/InStock"{%- else -%}"https://schema.org/OutOfStock"{%- endif -%},
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": {{ shop.name | json }} }
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ shop.url }}" },
    {%- if collection -%}
    { "@type": "ListItem", "position": 2, "name": {{ collection.title | json }}, "item": "{{ shop.url }}/collections/{{ collection.handle }}" },
    { "@type": "ListItem", "position": 3, "name": {{ product.title | json }}, "item": "{{ shop.url }}/products/{{ product.handle }}" }
    {%- else -%}
    { "@type": "ListItem", "position": 2, "name": {{ product.title | json }}, "item": "{{ shop.url }}/products/{{ product.handle }}" }
    {%- endif -%}
  ]
}
</script>
{%- endif -%}

{%- if request.page_type == 'collection' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "{{ shop.url }}/collections/{{ collection.handle }}#collectionpage",
  "name": {{ collection.title | json }},
  "url": "{{ shop.url }}/collections/{{ collection.handle }}",
  "hasPart": [
    {%- for p in collection.products limit: 20 -%}
    {
      "@type": "Product",
      "name": {{ p.title | json }},
      "url": "{{ shop.url }}/products/{{ p.handle }}",
      "offers": {
        "@type": "Offer",
        "price": "{{ p.price_min | money_without_currency | remove: ',' }}",
        "priceCurrency": {{ cart.currency.iso_code | json }},
        "availability": {%- if p.available -%}"https://schema.org/InStock"{%- else -%}"https://schema.org/OutOfStock"{%- endif -%}
      }
    }{%- unless forloop.last -%},{%- endunless -%}
    {%- endfor -%}
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ shop.url }}" },
    { "@type": "ListItem", "position": 2, "name": {{ collection.title | json }}, "item": "{{ shop.url }}/collections/{{ collection.handle }}" }
  ]
}
</script>
{%- endif -%}

{%- if request.page_type == 'page' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{ shop.url }}" },
    { "@type": "ListItem", "position": 2, "name": {{ page.title | json }}, "item": "{{ canonical_url }}" }
  ]
}
</script>
{%- endif -%}

{%- if request.page_type == 'index' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I choose between the 16 kWh and 28.7 kWh battery?",
      "acceptedAnswer": { "@type": "Answer", "text": "The 16 kWh battery is ideal for most homes (2-4 bedrooms) wanting daily solar storage and backup power. The 28.7 kWh is our flagship unit providing 24+ hours of whole-home backup and the best value per kWh. For large homes, high energy usage, or true off-grid capability, the 28.7 kWh is the better choice." }
    },
    {
      "@type": "Question",
      "name": "What is the difference between the 10 kW and 12 kW inverter?",
      "acceptedAnswer": { "@type": "Answer", "text": "Both inverters produce pure sine wave output and work with solar and battery systems. The 10 kW suits homes with up to 8 kW solar and standard loads. The 12 kW handles larger solar arrays, EV charging, and heavy appliances like central A/C and electric ranges simultaneously." }
    },
    {
      "@type": "Question",
      "name": "Can I install the EcoPowerWall myself?",
      "acceptedAnswer": { "@type": "Answer", "text": "EcoPowerWall products are designed for installation by a licensed electrician or solar installer. Detailed manuals and technical support are provided. We recommend working with a certified installer to ensure safety and warranty compliance." }
    },
    {
      "@type": "Question",
      "name": "How does the EcoPowerWall integrate with solar panels?",
      "acceptedAnswer": { "@type": "Answer", "text": "EcoPowerWall batteries connect to the inverter via CAN/RS485 communication. The inverter interfaces with solar panels via built-in MPPT charger, automatically prioritising solar charging and storing excess energy for nighttime or outage use." }
    },
    {
      "@type": "Question",
      "name": "What happens during a power outage?",
      "acceptedAnswer": { "@type": "Answer", "text": "When grid power is lost, the EcoPowerWall switches to battery backup in under 20 milliseconds. Essential loads like lights, refrigerator, and router continue running seamlessly from stored battery power." }
    },
    {
      "@type": "Question",
      "name": "Do I qualify for federal tax credits for a home battery?",
      "acceptedAnswer": { "@type": "Answer", "text": "Under the US Federal Investment Tax Credit (ITC), battery storage systems may qualify for a 30% tax credit when installed alongside solar. Many states also offer additional incentives. Consult a tax professional for your specific situation." }
    },
    {
      "@type": "Question",
      "name": "How long do EcoPowerWall batteries last?",
      "acceptedAnswer": { "@type": "Answer", "text": "EcoPowerWall LiFePO4 batteries are rated for 6,000+ charge cycles, approximately 16+ years of daily use. The 28.7 kWh battery comes with a 10-year warranty covering capacity retention." }
    },
    {
      "@type": "Question",
      "name": "What warranty comes with EcoPowerWall products?",
      "acceptedAnswer": { "@type": "Answer", "text": "The 10 kW and 12 kW inverters carry a 2-year manufacturer warranty. The 16 kWh battery has a 5-year warranty. The 28.7 kWh flagship battery includes a full 10-year warranty. All warranties cover defects in materials and workmanship." }
    }
  ]
}
</script>
{%- endif -%}
`;

(async () => {
  await fixThemeTitle();
  console.log(await putAsset("snippets/seo.liquid", newSeoLiquid));
  console.log(await putAsset("snippets/schema.liquid", newSchemaLiquid));
})();
