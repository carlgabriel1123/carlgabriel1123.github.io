require('dotenv').config();
const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const THEME = '179685556542';
const fs    = require('fs');

const get = async (key) => {
  const res = await fetch(
    `https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${encodeURIComponent(key)}`,
    { headers: { 'X-Shopify-Access-Token': TOKEN } }
  );
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { key, value: data.asset?.value || null, error: data.errors || null };
  } catch (e) {
    return { key, value: null, error: `JSON parse failed: ${e.message}` };
  }
};

(async () => {
  const files = [
    'snippets/scheme.liquid',
    'templates/product.liquid',
    'templates/collection.liquid',
  ];

  for (const f of files) {
    const r = await get(f);
    const safeName = f.replace(/\//g, '_');
    if (r.error) {
      console.log(`ERROR [${r.key}]:`, JSON.stringify(r.error));
    } else if (r.value) {
      fs.writeFileSync(`${safeName}.txt`, r.value, 'utf8');
      console.log(`Saved: ${safeName}.txt (${r.value.length} chars)`);
    }
  }
  console.log('Done.');
})();
