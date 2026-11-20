import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const OLD_SUPABASE_URL = 'https://jhfgsoegcsrbmdperiyz.supabase.co';
const NEW_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vvnihmweqmbmytpggqcw.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Export it before running this script.');
  process.exit(1);
}
const BUCKET_NAME = 'media';
const SRC_DIR = join(__dirname, 'src');

// Initialize Supabase client
const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

// Find all .asset.json files
function findAssetFiles(dir, files = []) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      findAssetFiles(fullPath, files);
    } else if (entry.endsWith('.asset.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Create bucket if not exists
async function ensureBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    throw listError;
  }
  
  const exists = buckets?.find(b => b.name === BUCKET_NAME);
  if (exists) {
    console.log(`Bucket "${BUCKET_NAME}" already exists`);
    return;
  }
  
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
  });
  
  if (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }
  console.log(`Created bucket "${BUCKET_NAME}"`);
}

// Download file from URL
async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${url} (${response.status})`);
  }
  return await response.arrayBuffer();
}

// Upload file to Supabase
async function uploadFile(path, buffer, contentType) {
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Upload failed for ${path}: ${error.message}`);
  }
}

// Get public URL for uploaded file
function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

// Get content type from extension
function getContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types = {
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

async function main() {
  console.log('=== Asset Migration: Lovable → Your Supabase ===\n');
  
  // Step 1: Ensure bucket exists
  console.log('Step 1: Creating storage bucket...');
  await ensureBucket();
  
  // Step 2: Find all asset files
  console.log('\nStep 2: Scanning for asset files...');
  const assetFiles = findAssetFiles(SRC_DIR);
  console.log(`Found ${assetFiles.length} asset files`);
  
  // Step 3: Process each file
  console.log('\nStep 3: Migrating files...');
  let success = 0;
  let failed = 0;
  const failedFiles = [];
  
  for (let i = 0; i < assetFiles.length; i++) {
    const assetJsonPath = assetFiles[i];
    const assetDir = dirname(assetJsonPath);
    const assetJson = JSON.parse(readFileSync(assetJsonPath, 'utf-8'));
    
    // Get the actual file path (remove .asset.json suffix)
    const baseName = assetJsonPath.replace('.asset.json', '');
    const originalFilename = assetJson.original_filename || baseName.split('/').pop();
    
    // Determine the actual file to download
    const oldUrl = assetJson.url;
    if (!oldUrl || !oldUrl.includes('supabase.co')) {
      console.log(`  [SKIP ${i + 1}/${assetFiles.length}] Not a Supabase URL: ${originalFilename}`);
      continue;
    }
    
    // Extract path from old URL for new upload
    const urlPath = new URL(oldUrl).pathname;
    // Path like /storage/v1/object/public/media/src/assets/...
    const pathMatch = urlPath.match(/\/media\/(.+)$/);
    const newPath = pathMatch ? pathMatch[1] : `src/${relative(SRC_DIR, baseName)}`;
    
    try {
      // Download from old Supabase
      console.log(`  [${i + 1}/${assetFiles.length}] Downloading: ${originalFilename}`);
      const buffer = await downloadFile(oldUrl);
      
      // Upload to new Supabase
      const contentType = getContentType(originalFilename);
      await uploadFile(newPath, buffer, contentType);
      
      // Get new public URL
      const newUrl = getPublicUrl(newPath);
      
      // Update asset.json
      const updatedAsset = {
        ...assetJson,
        url: newUrl,
        migrated_at: new Date().toISOString(),
        original_url: oldUrl,
      };
      writeFileSync(assetJsonPath, JSON.stringify(updatedAsset, null, 2));
      
      success++;
      console.log(`    ✓ Uploaded (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB)`);
    } catch (err) {
      failed++;
      failedFiles.push({ file: originalFilename, error: err.message });
      console.log(`    ✗ Failed: ${err.message}`);
    }
  }
  
  // Summary
  console.log('\n=== Migration Complete ===');
  console.log(`✓ Success: ${success}`);
  console.log(`✗ Failed: ${failed}`);
  
  if (failedFiles.length > 0) {
    console.log('\nFailed files:');
    failedFiles.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }
}

main().catch(console.error);
