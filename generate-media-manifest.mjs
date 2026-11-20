import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAPPING_FILE = join(__dirname, 'asset-mapping.json');
const OUTPUT_FILE = join(__dirname, 'public', 'asset-manifest.json');

if (!existsSync(MAPPING_FILE)) {
  console.error('❌ asset-mapping.json not found. Run upload-all-media.mjs first.');
  process.exit(1);
}

const mapping = JSON.parse(readFileSync(MAPPING_FILE, 'utf-8'));

const manifest = {
  version: 1,
  generated_at: new Date().toISOString(),
  project_id: mapping.project_id || 'vvnihmweqmbmytpggqcw',
  bucket: mapping.bucket || 'media',
  base_url: mapping.base_url || 'https://vvnihmweqmbmytpggqcw.supabase.co',
  total_files: mapping.total_files || mapping.files?.length || 0,
  files: mapping.files?.map((f) => ({
    key: f.local,
    source: f.source,
    remote: f.remote,
    url: f.url,
    size: f.size,
    type: f.type,
  })) || [],
  bySource: {
    'src/assets': mapping.files?.filter((f) => f.source === 'src/assets').map((f) => f.local) || [],
    'content': mapping.files?.filter((f) => f.source === 'content').map((f) => f.local) || [],
  },
  byType: {
    image: mapping.files?.filter((f) => ['jpg','jpeg','png','webp','gif','svg'].includes(f.type)).map((f) => f.local) || [],
    video: mapping.files?.filter((f) => ['mp4','webm','mov'].includes(f.type)).map((f) => f.local) || [],
    audio: mapping.files?.filter((f) => ['mp3','wav','ogg'].includes(f.type)).map((f) => f.local) || [],
  },
};

writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log(`✅ Generated asset-manifest.json at ${OUTPUT_FILE}`);
console.log(`   Total files: ${manifest.total_files}`);
console.log(`   Images: ${manifest.byType.image.length}`);
console.log(`   Videos: ${manifest.byType.video.length}`);
console.log(`   Audio: ${manifest.byType.audio.length}`);
console.log(`\n📝 Deploy: this file should be in public/ for client-side access`);
console.log(`   Or upload to Supabase Storage as: asset-manifest.json`);