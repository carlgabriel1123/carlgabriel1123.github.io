require('dotenv').config();

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const THEME = '179685556542';
const SKIP  = ['oos-1', 'allied-auto-online', 'oos', 'no-prices', 'archived'];

const H      = { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN };
const gql    = q => fetch(`https://${STORE}/admin/api/2024-01/graphql.json`, { method: 'POST', headers: H, body: JSON.stringify({ query: q }) }).then(r => r.json());
const asset  = async (key) => {
  const res  = await fetch(`https://${STORE}/admin/api/2024-01/themes/${THEME}/assets.json?asset[key]=${encodeURIComponent(key)}`, { headers: { 'X-Shopify-Access-Token': TOKEN } });
  const text = await res.text();
  return JSON.parse(text).asset?.value || '';
};
const rest   = async (path) => {
  const res  = await fetch(`https://${STORE}/admin/api/2024-01/${path}`, { headers: { 'X-Shopify-Access-Token': TOKEN } });
  return res.json();
};

const check = (label, pass) => console.log(`  ${pass ? '✓' : '✗'} ${label.padEnd(40)} ${pass ? 'PASS' : 'FAIL'}`);

(async () => {
  const [themeLiquid, scheme, shopSeo, aboutPage, colsData, pagesData, artsData] = await Promise.all([
    asset('layout/theme.liquid'),
    asset('snippets/scheme.liquid'),
    gql(`{ shop { titleTag: metafield(namespace:"global",key:"title_tag"){ value } descTag: metafield(namespace:"global",key:"description_tag"){ value } } }`),
    rest('pages.json?handle=about'),
    gql(`{ collections(first:50){ edges{ node{ handle seo{ title description } } } } }`),
    gql(`{ pages(first:20){ edges{ node{ handle titleTag: metafield(namespace:"global",key:"title_tag"){ value } descTag: metafield(namespace:"global",key:"description_tag"){ value } } } } }`),
    gql(`{ articles(first:20){ edges{ node{ handle titleTag: metafield(namespace:"global",key:"title_tag"){ value } } } } }`),
  ]);

  const colList  = colsData.data.collections.edges.map(e => e.node).filter(c => !SKIP.includes(c.handle));
  const colOk    = colList.filter(c => c.seo.title && c.seo.description).length;

  const pageList = pagesData.data.pages.edges.map(e => e.node).filter(p => !['wishlist', 'data-sharing-opt-out'].includes(p.handle));
  const pageOk   = pageList.filter(p => p.titleTag?.value).length;

  const artList  = artsData.data.articles.edges.map(e => e.node);
  const artOk    = artList.filter(a => a.titleTag?.value).length;

  const shop     = shopSeo.data.shop;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       ASIA PARTS STORE — SEO VERIFICATION REPORT    ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log('── TECHNICAL ─────────────────────────────────────────');
  check('Canonical tag in theme.liquid',     themeLiquid.includes('rel="canonical"'));
  check('HTTPS on all image srcs (schema)',  !scheme.includes('"image": "http:{{ variant'));

  console.log('\n── SCHEMA ────────────────────────────────────────────');
  check('Organization schema (sitewide)',    scheme.includes('"@type": "Organization"'));
  check('WebSite + SearchAction schema',     scheme.includes('"@type": "WebSite"'));
  check('Product @type capitalised',         scheme.includes('"@type": "Product"') && !scheme.includes('"@type": "product"'));
  check('BreadcrumbList on products',        scheme.includes('"@type": "BreadcrumbList"'));
  check('CollectionPage schema',             scheme.includes('"@type": "CollectionPage"'));
  check('Article schema',                    scheme.includes('"@type": "Article"'));
  check('Collection breadcrumb URL correct', scheme.includes('/collections/{{ collection.handle }}'));

  console.log('\n── ON-PAGE METADATA ──────────────────────────────────');
  check('Homepage SEO title',                !!shop.titleTag?.value);
  check('Homepage meta description',         !!shop.descTag?.value);
  check(`Collections SEO (${colOk}/${colList.length})`, colOk === colList.length);
  check(`Pages SEO (${pageOk}/${pageList.length})`,     pageOk === pageList.length);
  check(`Blog articles SEO (${artOk}/${artList.length})`, artOk === artList.length);

  console.log('\n── E-E-A-T ───────────────────────────────────────────');
  check('About page /pages/about exists',    aboutPage.pages?.length > 0);
  check('Contact page has SEO',              pageList.find(p => p.handle === 'contact')?.titleTag?.value ? true : false);

  console.log('\n── OPEN GAPS (manual actions required) ───────────────');
  console.log('  ○ Google Business Profile       — NOT SET (manual)');
  console.log('  ○ Trustpilot profile            — NOT SET (manual)');
  console.log('  ○ AggregateRating schema        — PENDING (needs reviews first)');
  console.log('  ○ Image alt text rendering      — PENDING (Phase 4)');
  console.log('  ○ Blog content hub              — PENDING (Phase 4)');

  // ── Score calculation ──────────────────────────────────────────────────────
  const scores = {
    'Technical SEO (canonical, HTTPS)':     themeLiquid.includes('rel="canonical"') && !scheme.includes('"image": "http:{{ variant') ? 8 : 5,
    'Schema markup':                        scheme.includes('"@type": "Organization"') && scheme.includes('"@type": "WebSite"') ? 8 : 3,
    'On-page metadata coverage':            (colOk === colList.length && pageOk === pageList.length && artOk === artList.length && shop.titleTag?.value) ? 10 : 6,
    'E-E-A-T signals':                      aboutPage.pages?.length ? 5 : 2,
    'Off-page & brand signals':             1,
    'GEO / AI readiness':                   2,
    'Content depth':                        2,
    'Core Web Vitals (inferred)':           4,
    'Site architecture':                    7,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const max   = 9 * 10;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                  SCORE BREAKDOWN                    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  Object.entries(scores).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(38)} ${v}/10`);
  });
  console.log(`\n  ${'OVERALL SCORE'.padEnd(38)} ${total}/${max}`);
  console.log(`  ${''.padEnd(38)} ${Math.round(total/max*100)}/100`);
})();
