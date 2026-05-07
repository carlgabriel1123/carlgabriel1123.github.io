require('dotenv').config();

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const THEME = '179685556542'; // main: Riot Snap Theme

const getAsset = async (key) => {
  const res  = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${encodeURIComponent(key)}`,
    { headers: { 'X-Shopify-Access-Token': TOKEN } }
  );
  const text = await res.text();
  return JSON.parse(text).asset.value;
};

const putAsset = async (key, value) => {
  const res = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
      body: JSON.stringify({ asset: { key, value } }),
    }
  );
  const text = await res.text();
  const data = JSON.parse(text);
  return data.asset ? 'OK' : data.errors;
};

const gql = (query) =>
  fetch(`https://${STORE}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
    body: JSON.stringify({ query }),
  }).then(r => r.json());

// ── Organization + WebSite schema block ───────────────────────────────────────
// Injected once on every page (sitewide)
const ORG_SCHEMA = `{%- comment -%}Phase 3: Organization + WebSite schema — Asia Parts Store{%- endcomment -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Asia Parts Store",
  "url": "https://asiapartsstore.com",
  "logo": "https://asiapartsstore.com/cdn/shop/files/logo.png",
  "description": "Asia Parts Store is an online retailer of aftermarket and OEM-spec car parts for Japanese, Korean, and imported vehicles. Fast delivery across Australia and New Zealand.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "20 Ada Street",
    "addressLocality": "Remuera",
    "addressRegion": "Auckland",
    "postalCode": "1050",
    "addressCountry": "NZ"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-888-417-9079",
    "contactType": "customer service",
    "availableLanguage": "English",
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  },
  "sameAs": [
    "https://www.facebook.com/Asiaparts.kst/"
  ],
  "email": "info@asiapartsstore.com"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Asia Parts Store",
  "url": "https://asiapartsstore.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://asiapartsstore.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
`;

(async () => {
  // ── 1. Update scheme.liquid ──────────────────────────────────────────────────
  console.log('Fetching scheme.liquid...');
  let scheme = await getAsset('snippets/scheme.liquid');
  const originalLength = scheme.length;

  // Fix 1: @type product → Product (case-sensitive schema.org)
  scheme = scheme.replace('"@type": "product"', '"@type": "Product"');

  // Fix 2: http: → https: on variant image src (insecure mixed-content risk)
  scheme = scheme.replace(
    '"image": "http:{{ variant.image.src',
    '"image": "https:{{ variant.image.src'
  );

  // Fix 3: Collection breadcrumb URL — was /handle, should be /collections/handle
  scheme = scheme.replace(
    '"item": "{{url}}/{{ collection.handle }}"',
    '"item": "{{ shop.url }}/collections/{{ collection.handle }}"'
  );

  // Fix 4: Prepend Organization + WebSite schema (sitewide)
  if (!scheme.includes('Organization')) {
    scheme = ORG_SCHEMA + scheme;
    console.log('  + Organization + WebSite schema injected');
  } else {
    console.log('  ~ Organization schema already present, skipping inject');
  }

  console.log(`  Original: ${originalLength} chars → Updated: ${scheme.length} chars`);

  console.log('Pushing scheme.liquid...');
  const schemeResult = await putAsset('snippets/scheme.liquid', scheme);
  console.log('  scheme.liquid:', schemeResult);

  // ── 2. Fix homepage SEO title + description ──────────────────────────────────
  console.log('\nSetting homepage (shop-level) SEO title + description...');
  const homepageMeta = await gql(`mutation {
    metafieldsSet(metafields: [
      {
        ownerId: "gid://shopify/Shop/94814863678",
        namespace: "global",
        key: "title_tag",
        value: "Aftermarket Car Parts for Japanese & Korean Vehicles | Asia Parts Store",
        type: "single_line_text_field"
      },
      {
        ownerId: "gid://shopify/Shop/94814863678",
        namespace: "global",
        key: "description_tag",
        value: "Shop quality aftermarket and OEM-spec car parts for Toyota, Nissan, Honda, Mitsubishi, Subaru and more. Fast delivery to Australia and New Zealand. Fitment guaranteed.",
        type: "single_line_text_field"
      }
    ]) {
      metafields { key value }
      userErrors { field message }
    }
  }`);

  const hpRes = homepageMeta.data?.metafieldsSet;
  if (hpRes?.userErrors?.length) {
    console.log('  FAIL:', hpRes.userErrors.map(e => e.message).join(', '));
  } else {
    hpRes?.metafields?.forEach(m => console.log(`  OK  ${m.key}: ${m.value}`));
  }

  console.log('\nPhase 3 schema updates complete.');
})();
