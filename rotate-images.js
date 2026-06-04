/**
 * Rotate all product images 90° counterclockwise
 * (head pointing right → upright)
 */
const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const dir = path.join(__dirname, 'frontend/public/products');

async function rotateAll() {
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  console.log(`Rotating ${files.length} images 90° counterclockwise...`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const tmpPath  = filePath + '.tmp';
    try {
      await sharp(filePath)
        .rotate(-90)          // -90 = counterclockwise
        .toFile(tmpPath);
      fs.renameSync(tmpPath, filePath);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  }
  console.log('Done!');
}

rotateAll();
