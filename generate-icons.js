import { existsSync, mkdirSync, readFileSync } from 'fs';
import sharp from 'sharp';

const sizes = [16, 32, 48, 128];

async function generateIcons() {
  
  if (!existsSync('icons')) {
    mkdirSync('icons');
  }

  for (const size of sizes) {
    const svgContent = readFileSync(`icon${size}.svg`);
    
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(`icons/icon${size}.png`);
    
    console.log(`Generated icon${size}.png`);
  }
}

generateIcons().catch(console.error);