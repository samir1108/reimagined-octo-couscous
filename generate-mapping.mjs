import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, 'src', 'assets');
const NEW_SUPABASE_URL = 'https://vvnihmweqmbmytpggqcw.supabase.co';
const BUCKET_NAME = 'media';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];

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
  } catch (e) {}
  return files;
}

function getPublicUrl(path) {
  return `${NEW_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

const mediaFiles = findAllMediaFiles(SRC_DIR);
const mapping = {
  generated_at: new Date().toISOString(),
  bucket: BUCKET_NAME,
  base_url: NEW_SUPABASE_URL,
  total_files: mediaFiles.length,
  files: mediaFiles.map(localPath => {
    const relativePath = relative(SRC_DIR, localPath);
    const remotePath = `src/assets/${relativePath}`;
    return {
      local: relativePath,
      remote: remotePath,
      url: getPublicUrl(remotePath),
    };
  }),
};

writeFileSync(join(__dirname, 'asset-mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`Generated mapping for ${mapping.total_files} files`);
console.log(`Saved to: asset-mapping.json`);
