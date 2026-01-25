/**
 * Data File Verification Script
 * 
 * Verifies that all HIGH-priority data files exist and are accessible
 * before starting ingestion pipeline.
 * 
 * Usage:
 *   pnpm verify:data
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';

interface DataFile {
  id: string;
  path: string;
  description: string;
  required: boolean;
  minSize?: number; // bytes
}

const DATA_FILES: DataFile[] = [
  // INGEST-02: GDSN Current
  {
    id: 'gdsn_classes',
    path: 'data/gs1/gdsn/gdsn_classes.json',
    description: 'GDSN product classes',
    required: true,
    minSize: 100000 // ~100 KB
  },
  {
    id: 'gdsn_class_attributes',
    path: 'data/gs1/gdsn/gdsn_classAttributes.json',
    description: 'GDSN class attributes',
    required: true,
    minSize: 500000 // ~500 KB
  },
  {
    id: 'gdsn_validation_rules',
    path: 'data/gs1/gdsn/gdsn_validationRules.json',
    description: 'GDSN validation rules',
    required: true,
    minSize: 100000 // ~100 KB
  },
  
  // INGEST-03: ESRS Datapoints
  {
    id: 'esrs_datapoints',
    path: 'data/efrag/EFRAGIG3ListofESRSDataPoints.xlsx',
    description: 'EFRAG ESRS datapoints',
    required: true,
    minSize: 100000 // ~100 KB
  },
  
  // INGEST-04: CTEs and KDEs
  {
    id: 'ctes_kdes',
    path: 'data/esg/ctes_and_kdes.json',
    description: 'Critical Tracking Events and Key Data Elements',
    required: true,
    minSize: 5000 // ~5 KB
  },
  
  // INGEST-05: DPP Identification
  {
    id: 'dpp_components',
    path: 'data/esg/dpp_identifier_components.json',
    description: 'DPP identifier components',
    required: true,
    minSize: 5000 // ~5 KB
  },
  {
    id: 'dpp_rules',
    path: 'data/esg/dpp_identification_rules.json',
    description: 'DPP identification rules',
    required: true,
    minSize: 5000 // ~5 KB
  },
  
  // INGEST-06: CBV Vocabularies
  {
    id: 'cbv_vocabularies',
    path: 'data/cbv/cbv_esg_curated.json',
    description: 'CBV ESG-curated vocabularies',
    required: true,
    minSize: 10000 // ~10 KB
  },
  {
    id: 'digital_link_types',
    path: 'data/digital_link/linktypes.json',
    description: 'GS1 Digital Link types',
    required: true,
    minSize: 10000 // ~10 KB
  }
];

interface VerificationResult {
  file: DataFile;
  exists: boolean;
  size?: number;
  error?: string;
}

function verifyFile(file: DataFile): VerificationResult {
  const fullPath = join(process.cwd(), file.path);
  
  if (!existsSync(fullPath)) {
    return {
      file,
      exists: false,
      error: 'File not found'
    };
  }
  
  try {
    const stats = statSync(fullPath);
    const size = stats.size;
    
    if (file.minSize && size < file.minSize) {
      return {
        file,
        exists: true,
        size,
        error: `File too small (${size} bytes, expected >${file.minSize} bytes)`
      };
    }
    
    return {
      file,
      exists: true,
      size
    };
  } catch (error) {
    return {
      file,
      exists: true,
      error: `Cannot read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function main() {
  console.log('🔍 Verifying ISA data files...\n');
  
  const results = DATA_FILES.map(verifyFile);
  
  const passed = results.filter(r => r.exists && !r.error);
  const failed = results.filter(r => !r.exists || r.error);
  
  // Print results
  console.log('✅ PASSED:');
  passed.forEach(r => {
    console.log(`  ✓ ${r.file.id}`);
    console.log(`    Path: ${r.file.path}`);
    console.log(`    Size: ${r.size ? formatSize(r.size) : 'Unknown'}`);
    console.log(`    Description: ${r.file.description}`);
    console.log();
  });
  
  if (failed.length > 0) {
    console.log('❌ FAILED:');
    failed.forEach(r => {
      console.log(`  ✗ ${r.file.id}`);
      console.log(`    Path: ${r.file.path}`);
      console.log(`    Error: ${r.error}`);
      console.log(`    Description: ${r.file.description}`);
      console.log();
    });
  }
  
  // Summary
  console.log('─'.repeat(60));
  console.log(`Total files: ${DATA_FILES.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  
  if (failed.length === 0) {
    console.log('\n✅ All data files verified successfully!');
    console.log('Ready to start ingestion pipeline.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some data files are missing or invalid.');
    console.log('Please fix the issues above before starting ingestion.\n');
    
    // Print helpful instructions
    console.log('💡 To fix:');
    console.log('1. Extract isa_data_sources_full_ingest.zip');
    console.log('2. Move files to correct paths under /data/');
    console.log('3. Run this script again: pnpm verify:data\n');
    
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyFile, DATA_FILES };
export type { DataFile, VerificationResult };
