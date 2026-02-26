import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
const out = process.argv[3];
if (!root || !out) {
  console.error('Usage: node build_inventory.mjs <root> <out>');
  process.exit(1);
}

const skip = new Set(['.git', 'node_modules', '.DS_Store']);

const extCounts = new Map();
const dirFileCounts = new Map();
const categoryCounts = new Map();

function classify(relPath) {
  const p = relPath.replace(/\\/g, '/');
  if (p.startsWith('skills/')) return 'skills';
  if (p.startsWith('extensions/')) return 'extensions';
  if (p.startsWith('docs/')) return 'docs';
  if (p.startsWith('ui/')) return 'ui';
  if (p.startsWith('scripts/')) return 'scripts';
  if (p.startsWith('test/')) return 'tests';
  if (p.startsWith('packages/')) return 'packages';
  if (p.startsWith('src/')) return 'src';
  if (p.includes('config') || p.endsWith('.json') || p.endsWith('.yaml') || p.endsWith('.yml') || p.endsWith('.toml') || p.endsWith('.env')) return 'config';
  return 'other';
}

function walk(abs, rel='') {
  const st = fs.statSync(abs);
  if (st.isFile()) {
    const base = path.basename(abs);
    const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')).toLowerCase() : '<none>';
    extCounts.set(ext, (extCounts.get(ext) || 0) + 1);
    const parent = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '.';
    dirFileCounts.set(parent, (dirFileCounts.get(parent) || 0) + 1);
    const cat = classify(rel);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    return { name: base, type: 'file' };
  }
  const name = rel ? path.basename(abs) : path.basename(root);
  const children = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const childAbs = path.join(abs, ent.name);
    const childRel = rel ? `${rel}/${ent.name}` : ent.name;
    children.push(walk(childAbs, childRel));
  }
  children.sort((a,b)=> a.type===b.type ? a.name.localeCompare(b.name) : (a.type==='directory'?-1:1));
  return { name, type: 'directory', children };
}

const tree = walk(root, '');
const ext = Array.from(extCounts.entries()).sort((a,b)=> b[1]-a[1]).map(([extension,count])=>({extension,count}));
const topClusters = Array.from(dirFileCounts.entries())
  .filter(([dir]) => dir === '.' || !dir.includes('/'))
  .sort((a,b)=> b[1]-a[1])
  .map(([dir,fileCount])=>({dir,fileCount}));
const categories = Array.from(categoryCounts.entries()).sort((a,b)=> b[1]-a[1]).map(([category,count])=>({category,count}));

const payload = {
  generatedAt: new Date().toISOString(),
  root,
  summary: {
    totalFiles: ext.reduce((n,e)=> n + e.count, 0),
    extensionKinds: ext.length,
  },
  extensionCounts: ext,
  topClusters,
  categoryCounts: categories,
  tree,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(`WROTE=${out}`);
