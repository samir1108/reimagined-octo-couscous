import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const NEW_SUPABASE_URL = 'https://vvnihmweqmbmytpggqcw.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Export it before running this script.');
  process.exit(1);
}
const BUCKET_NAME = 'media';
const SRC_DIR = join(__dirname, 'src', 'assets');

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];

function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  const types = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

function findAllMediaFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        findAllMediaFiles(fullPath, files);
      } else {
        const ext = extname(entry).toLowerCase();
        if ([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (e) {
    // Skip directories we can't read
  }
  return files;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.find(b => b.name === BUCKET_NAME);
  if (exists) {
    console.log(`Bucket "${BUCKET_NAME}" already exists`);
    return;
  }
  await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  console.log(`Created bucket "${BUCKET_NAME}"`);
}

async function uploadFile(localPath, remotePath) {
  const buffer = readFileSync(localPath);
  const contentType = getContentType(localPath);
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(remotePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  return buffer.byteLength;
}

function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  console.log('=== Upload Local Assets to Supabase Storage ===\n');
  
  await ensureBucket();
  
  console.log('Scanning for local media files...');
  const mediaFiles = findAllMediaFiles(SRC_DIR);
  console.log(`Found ${mediaFiles.length} media files\n`);
  
  let success = 0;
  let failed = 0;
  let totalBytes = 0;
  const failedFiles = [];
  const uploadedFiles = [];
  
  for (let i = 0; i < mediaFiles.length; i++) {
    const localPath = mediaFiles[i];
    const relativePath = relative(SRC_DIR, localPath);
    // Use same path structure: src/assets/...
    const remotePath = `src/assets/${relativePath}`;
    
    try {
      const size = await uploadFile(localPath, remotePath);
      const publicUrl = getPublicUrl(remotePath);
      
      success++;
      totalBytes += size;
      uploadedFiles.push({ localPath, remotePath, publicUrl, size });
      
      const sizeMB = (size / 1024 / 1024).toFixed(1);
      console.log(`  [${i + 1}/${mediaFiles.length}] ✓ ${relativePath} (${sizeMB}MB)`);
    } catch (err) {
      failed++;
      failedFiles.push({ file: relativePath, error: err.message });
      console.log(`  [${i + 1}/${mediaFiles.length}] ✗ ${relativePath}: ${err.message}`);
    }
  }
  
  console.log('\n=== Upload Complete ===');
  console.log(`✓ Success: ${success}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total uploaded: ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);
  
  // Save mapping file for reference
  const mappingFile = join(__dirname, 'asset-mapping.json');
  writeFileSync(mappingFile, JSON.stringify({
    uploaded_at: new Date().toISOString(),
    bucket: BUCKET_NAME,
    base_url: NEW_SUPABASE_URL,
    files: uploadedFiles,
    failed: failedFiles,
  }, null, 2));
  console.log(`\nMapping saved to: ${mappingFile}`);
  
  if (failedFiles.length > 0) {
    console.log('\nFailed files:');
    failedFiles.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }
}

main().catch(console.error);
