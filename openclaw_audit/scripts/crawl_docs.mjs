import fs from 'node:fs';
import path from 'node:path';

const outDir = process.argv[2];
if (!outDir) {
  console.error('Usage: node crawl_docs.mjs <outDir>');
  process.exit(1);
}

const sitemapUrl = 'https://docs.openclaw.ai/sitemap.xml';
const now = new Date().toISOString();
fs.mkdirSync(outDir, { recursive: true });
const pagesDir = path.join(outDir, 'pages');
fs.mkdirSync(pagesDir, { recursive: true });

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
function stripTags(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}
function extractTag(html, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  return m ? stripTags(m[1]) : '';
}
function extractHeadings(html, level) {
  const re = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = stripTags(m[1]);
    if (t) out.push(t);
  }
  return out;
}

const smRes = await fetch(sitemapUrl);
if (!smRes.ok) {
  throw new Error(`Failed sitemap: ${smRes.status}`);
}
const smXml = await smRes.text();
const locs = Array.from(smXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
const lastmods = new Map(Array.from(smXml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)).map(m => [m[1].trim(), m[2].trim()]));

const index = [];
let i = 0;
for (const url of locs) {
  i += 1;
  const slug = url.replace('https://docs.openclaw.ai/', '').replace(/[^a-zA-Z0-9/_-]/g, '_') || 'root';
  const safeName = slug.replace(/\//g, '__');
  let status = 'UNVERIFIED';
  let statusCode = 0;
  let title = '';
  let h1 = [];
  let h2 = [];
  let snippet = '';
  let content = '';
  try {
    const res = await fetch(url, { redirect: 'follow' });
    statusCode = res.status;
    const html = await res.text();
    title = extractTag(html, 'title');
    h1 = extractHeadings(html, 1);
    h2 = extractHeadings(html, 2);
    content = stripTags(html).slice(0, 30000);
    snippet = content.slice(0, 500);
    status = statusCode === 200 ? 'CONFIRMED' : 'UNVERIFIED';
  } catch (err) {
    snippet = String(err?.message || err);
    status = 'UNVERIFIED';
  }

  const section = url.replace('https://docs.openclaw.ai/', '').split('/')[0] || 'root';
  const rec = {
    url,
    fetchedAt: now,
    sitemapLastmod: lastmods.get(url) || null,
    section,
    title,
    h1,
    h2,
    statusCode,
    status,
    snippet,
  };
  index.push(rec);

  const pagePayload = {
    ...rec,
    content,
  };
  fs.writeFileSync(path.join(pagesDir, `${String(i).padStart(4, '0')}__${safeName}.json`), JSON.stringify(pagePayload, null, 2));
}

const output = {
  generatedAt: now,
  sitemapUrl,
  urlCount: index.length,
  confirmedCount: index.filter((r) => r.status === 'CONFIRMED').length,
  unverifiedCount: index.filter((r) => r.status !== 'CONFIRMED').length,
  bySection: Object.entries(index.reduce((acc, r) => {
    acc[r.section] = (acc[r.section] || 0) + 1;
    return acc;
  }, {})).sort((a,b)=>b[1]-a[1]).map(([section,count])=>({section,count})),
  urls: index,
};

fs.writeFileSync(path.join(outDir, 'DOCS_INDEX.json'), JSON.stringify(output, null, 2));
console.log(`URLS=${output.urlCount}`);
console.log(`CONFIRMED=${output.confirmedCount}`);
console.log(`UNVERIFIED=${output.unverifiedCount}`);
