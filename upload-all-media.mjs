import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://vvnihmweqmbmytpggqcw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const BUCKET_NAME = 'media';
const SRC_ASSETS_DIR = join(__dirname, 'src', 'assets');
const CONTENT_DIR = join(__dirname, 'content');

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set. Run: export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];
const ALL_MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS];

function getContentType(filename) {
  const ext = extname(filename).toLowerCase();
  const types = {
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}

function findAllMediaFiles(dir, files = [], baseDir = dir) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        findAllMediaFiles(fullPath, files, baseDir);
      } else {
        const ext = extname(entry).toLowerCase();
        if (ALL_MEDIA_EXTENSIONS.includes(ext)) {
          const relativePath = relative(baseDir, fullPath);
          files.push({ fullPath, relativePath, ext });
        }
      }
    }
  } catch (e) {
    console.warn(`  ⚠ Could not read ${dir}: ${e.message}`);
  }
  return files;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.find(b => b.name === BUCKET_NAME);
  if (exists) {
    console.log(`✓ Bucket "${BUCKET_NAME}" already exists`);
    return;
  }
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  if (error) throw error;
  console.log(`✓ Created bucket "${BUCKET_NAME}"`);
}

async function uploadFile(localPath, remotePath, contentType) {
  const buffer = readFileSync(localPath);
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
  console.log('=== Upload ALL Media to Supabase Storage ===\n');
  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET_NAME}\n`);

  await ensureBucket();

  // 1. Upload images from src/assets
  console.log('📁 Scanning src/assets (images)...');
  const assetImages = findAllMediaFiles(SRC_ASSETS_DIR, [], SRC_ASSETS_DIR)
    .filter(f => IMAGE_EXTENSIONS.includes(f.ext));
  console.log(`   Found ${assetImages.length} images\n`);

  // 2. Upload video/audio from content/
  console.log('📁 Scanning content/ (video/audio)...');
  const contentMedia = findAllMediaFiles(CONTENT_DIR, [], CONTENT_DIR)
    .filter(f => VIDEO_EXTENSIONS.includes(f.ext) || AUDIO_EXTENSIONS.includes(f.ext));
  console.log(`   Found ${contentMedia.length} video/audio files\n`);

  const allFiles = [
    ...assetImages.map(f => ({ ...f, source: 'src/assets', remotePrefix: 'src/assets' })),
    ...contentMedia.map(f => ({ ...f, source: 'content', remotePrefix: 'content' })),
  ];

  console.log(`📦 Total files to upload: ${allFiles.length}\n`);

  let success = 0, failed = 0, totalBytes = 0;
  const uploadedFiles = [], failedFiles = [];

  for (let i = 0; i < allFiles.length; i++) {
    const { fullPath, relativePath, ext, source, remotePrefix } = allFiles[i];
    const remotePath = `${remotePrefix}/${relativePath}`;
    const contentType = getContentType(fullPath);

    try {
      const size = await uploadFile(fullPath, remotePath, contentType);
      const publicUrl = getPublicUrl(remotePath);

      success++;
      totalBytes += size;
      uploadedFiles.push({
        local: relativePath,
        source,
        remote: remotePath,
        url: publicUrl,
        size,
        type: ext.startsWith('.') ? ext.slice(1) : ext,
      });

      const sizeMB = (size / 1024 / 1024).toFixed(1);
      const pct = ((i + 1) / allFiles.length * 100).toFixed(0);
      console.log(`  [${pct}%] ✓ ${source}/${relativePath} (${sizeMB}MB)`);
    } catch (err) {
      failed++;
      failedFiles.push({ file: `${source}/${relativePath}`, error: err.message });
      console.log(`  [${((i + 1) / allFiles.length * 100).toFixed(0)}%] ✗ ${source}/${relativePath}: ${err.message}`);
    }
  }

  console.log('\n=== Upload Complete ===');
  console.log(`✓ Success: ${success}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total uploaded: ${(totalBytes / 1024 / 1024).toFixed(1)}MB`);

  // Save comprehensive mapping
  const mappingFile = join(__dirname, 'asset-mapping.json');
  writeFileSync(mappingFile, JSON.stringify({
    uploaded_at: new Date().toISOString(),
    project_id: 'vvnihmweqmbmytpggqcw',
    bucket: BUCKET_NAME,
    base_url: SUPABASE_URL,
    total_files: uploadedFiles.length,
    total_size_mb: (totalBytes / 1024 / 1024).toFixed(1),
    files: uploadedFiles,
    failed: failedFiles,
  }, null, 2));
  console.log(`\n📄 Mapping saved to: ${mappingFile}`);

  if (failedFiles.length > 0) {
    console.log('\n❌ Failed files:');
    failedFiles.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }

  console.log('\n✅ Next steps:');
  console.log('  1. Run: node generate-media-manifest.mjs (to create lookup manifest)');
  console.log('  2. Update components to use src/lib/media/mediaLoader.ts');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });