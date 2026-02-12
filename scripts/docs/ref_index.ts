#!/usr/bin/env node
/**
 * Reference Index Generator
 * Scans repository for all references and generates inbound link graph
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REPO_ROOT = process.cwd();
const OUTPUT_DIR = 'docs/architecture/panel/_generated';
const REF_INDEX_FILE = path.join(OUTPUT_DIR, 'REF_INDEX.json');
const INBOUND_LINKS_FILE = path.join(OUTPUT_DIR, 'INBOUND_LINKS.json');

// File patterns to scan
const SCAN_PATTERNS = [
  '**/*.md',
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.json',
  '**/*.yml',
  '**/*.yaml'
];

const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '**/_generated/**'
];

interface Reference {
  from_file: string;
  line_number: number;
  snippet: string;
  reference_type: 'markdown_link' | 'relative_path' | 'evidence_marker' | 'import';
}

interface ReferencedPath {
  path: string;
  exists: boolean;
  inbound_count: number;
  inbound_locations: Reference[];
}

function findAllFiles(): string[] {
  const files: string[] = [];
  
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(REPO_ROOT, fullPath);
      
      // Skip excluded patterns
      if (EXCLUDE_PATTERNS.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(relativePath);
      })) {
        continue;
      }
      
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.md', '.ts', '.tsx', '.js', '.jsx', '.json', '.yml', '.yaml'].includes(ext)) {
          files.push(relativePath);
        }
      }
    }
  }
  
  walk(REPO_ROOT);
  return files.sort();
}

function extractReferences(filePath: string): Map<string, Reference[]> {
  const references = new Map<string, Reference[]>();
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Markdown links: [text](path)
      const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = mdLinkRegex.exec(line)) !== null) {
        const refPath = match[2].split('#')[0]; // Remove anchors
        if (refPath && !refPath.startsWith('http')) {
          const ref: Reference = {
            from_file: filePath,
            line_number: lineNumber,
            snippet: line.trim().substring(0, 100),
            reference_type: 'markdown_link'
          };
          if (!references.has(refPath)) references.set(refPath, []);
          references.get(refPath)!.push(ref);
        }
      }
      
      // Evidence markers: <!-- EVIDENCE:type:path -->
      const evidenceRegex = /<!--\s*EVIDENCE:\w+:([^\s]+)\s*-->/g;
      while ((match = evidenceRegex.exec(line)) !== null) {
        const refPath = match[1];
        const ref: Reference = {
          from_file: filePath,
          line_number: lineNumber,
          snippet: line.trim(),
          reference_type: 'evidence_marker'
        };
        if (!references.has(refPath)) references.set(refPath, []);
        references.get(refPath)!.push(ref);
      }
      
      // Import statements
      const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
      while ((match = importRegex.exec(line)) !== null) {
        const refPath = match[1];
        if (!refPath.startsWith('@') && !refPath.startsWith('node:')) {
          const ref: Reference = {
            from_file: filePath,
            line_number: lineNumber,
            snippet: line.trim().substring(0, 100),
            reference_type: 'import'
          };
          if (!references.has(refPath)) references.set(refPath, []);
          references.get(refPath)!.push(ref);
        }
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error);
  }
  
  return references;
}

function resolveReferencePath(fromFile: string, refPath: string): string {
  // Handle absolute paths from repo root
  if (refPath.startsWith('/')) {
    return refPath.substring(1);
  }
  
  // Handle relative paths
  const fromDir = path.dirname(fromFile);
  const resolved = path.normalize(path.join(fromDir, refPath));
  return resolved;
}

function main() {
  console.log('Scanning repository for references...');
  
  const files = findAllFiles();
  console.log(`Found ${files.length} files to scan`);
  
  const allReferences = new Map<string, Reference[]>();
  
  for (const file of files) {
    const refs = extractReferences(file);
    refs.forEach((refList, refPath) => {
      const resolvedPath = resolveReferencePath(file, refPath);
      if (!allReferences.has(resolvedPath)) {
        allReferences.set(resolvedPath, []);
      }
      allReferences.get(resolvedPath)!.push(...refList);
    });
  }
  
  console.log(`Found ${allReferences.size} unique referenced paths`);
  
  // Build reference index
  const refIndex: ReferencedPath[] = [];
  allReferences.forEach((refs, refPath) => {
    const exists = fs.existsSync(path.join(REPO_ROOT, refPath));
    refIndex.push({
      path: refPath,
      exists,
      inbound_count: refs.length,
      inbound_locations: refs.sort((a, b) => a.from_file.localeCompare(b.from_file))
    });
  });
  
  // Sort by path
  refIndex.sort((a, b) => a.path.localeCompare(b.path));
  
  // Build inbound links summary
  const inboundLinks = refIndex.map(ref => ({
    referenced_path: ref.path,
    exists: ref.exists,
    inbound_count: ref.inbound_count,
    inbound_files: [...new Set(ref.inbound_locations.map(loc => loc.from_file))].sort()
  }));
  
  // Write outputs
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  fs.writeFileSync(REF_INDEX_FILE, JSON.stringify({
    meta: {
      generated_at: new Date().toISOString(),
      total_references: allReferences.size,
      scanned_files: files.length
    },
    references: refIndex
  }, null, 2));
  
  fs.writeFileSync(INBOUND_LINKS_FILE, JSON.stringify({
    meta: {
      generated_at: new Date().toISOString(),
      total_paths: inboundLinks.length
    },
    inbound_links: inboundLinks
  }, null, 2));
  
  console.log(`\nReference index written to ${REF_INDEX_FILE}`);
  console.log(`Inbound links written to ${INBOUND_LINKS_FILE}`);
  
  // Summary statistics
  const broken = refIndex.filter(r => !r.exists).length;
  const orphans = refIndex.filter(r => r.inbound_count === 0).length;
  
  console.log(`\nSummary:`);
  console.log(`  Total referenced paths: ${refIndex.length}`);
  console.log(`  Broken references: ${broken}`);
  console.log(`  Orphaned paths: ${orphans}`);
}

main();
