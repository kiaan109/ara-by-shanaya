import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

async function getJpgs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...await getJpgs(full));
    } else if (/\.(jpg|jpeg)$/i.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

async function compress(file) {
  const info = await stat(file);
  const sizeBefore = (info.size / 1024).toFixed(0);
  if (info.size < 80 * 1024) return; // skip files already under 80KB

  try {
    const img = sharp(file);
    const meta = await img.metadata();
    const resized = meta.width > 1200 ? img.resize({ width: 1200, withoutEnlargement: true }) : img;
    const buf = await resized.jpeg({ quality: 72, progressive: true, mozjpeg: true }).toBuffer();

    if (buf.length < info.size * 0.9) {
      await writeFile(file, buf);
      const sizeAfter = (buf.length / 1024).toFixed(0);
      const saving = Math.round((1 - buf.length / info.size) * 100);
      console.log(`✓ ${basename(file)}: ${sizeBefore}KB → ${sizeAfter}KB (-${saving}%)`);
    }
  } catch (e) {
    console.error(`✗ ${basename(file)}: ${e.message}`);
  }
}

const jpgs = await getJpgs(PUBLIC);
console.log(`Found ${jpgs.length} images. Compressing…`);
for (const f of jpgs) await compress(f);

// Report total
const afterSizes = await Promise.all(jpgs.map(f => stat(f).then(s => s.size)));
const totalMB = (afterSizes.reduce((a,b)=>a+b,0) / 1024 / 1024).toFixed(1);
console.log(`Done. Total image size now: ${totalMB}MB`);
