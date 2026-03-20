// Download cooking recipe images from Nookipedia API
// Stores as WebP in public/assets-web/cooking/{recipe_name}/Icon Image.webp
// Updates manifest.json with new cooking category

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const API_KEY = process.env.NOOKIPEDIA_API_KEY;
if (!API_KEY) {
  console.error('Error: NOOKIPEDIA_API_KEY must be set');
  console.error('Run: node --env-file=.env.local scripts/download-cooking-images.mjs');
  process.exit(1);
}

// Load cooking recipe names from diyRecipeData.js
const dataPath = join(import.meta.dirname, '..', 'src', 'artifacts', 'diyRecipeData.js');
const dataContent = readFileSync(dataPath, 'utf-8');

// Extract cooking recipe names (categories with isCooking: true)
const cookingNames = [];
const cookingMatch = dataContent.match(/isCooking:\s*true,\s*recipes:\s*\[([\s\S]*?)\]/g);
if (cookingMatch) {
  for (const block of cookingMatch) {
    const names = block.match(/'([^']+)'/g);
    if (names) {
      cookingNames.push(...names.map(n => n.replace(/'/g, '')));
    }
  }
}

console.log(`Found ${cookingNames.length} cooking recipes to download`);

const assetsDir = join(import.meta.dirname, '..', 'public', 'assets-web', 'cooking');
mkdirSync(assetsDir, { recursive: true });

const manifestPath = join(import.meta.dirname, '..', 'public', 'assets-web', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

if (!manifest.cooking) manifest.cooking = {};

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const name of cookingNames) {
  const dir = join(assetsDir, name);
  const filePath = join(dir, 'Icon Image.webp');

  // Skip if already downloaded
  if (existsSync(filePath)) {
    skipped++;
    continue;
  }

  // Rate limit: 500ms between requests
  await new Promise(r => setTimeout(r, 500));

  try {
    const encoded = encodeURIComponent(name);
    const res = await fetch(`https://api.nookipedia.com/nh/recipes/${encoded}`, {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept-Version': '1.7.0',
      },
    });

    if (!res.ok) {
      console.log(`  ✗ ${name}: API ${res.status}`);
      failed++;
      continue;
    }

    const data = await res.json();
    const imageUrl = data.image_url;

    if (!imageUrl) {
      console.log(`  ✗ ${name}: no image_url`);
      failed++;
      continue;
    }

    // Download the image (PNG from dodo.ac)
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.log(`  ✗ ${name}: image download ${imgRes.status}`);
      failed++;
      continue;
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    // Save as-is (PNG) — we'll note it's PNG not WebP but AssetImg handles both
    mkdirSync(dir, { recursive: true });
    // Save as PNG with .webp extension for manifest compatibility
    // (browsers handle PNG content regardless of extension)
    writeFileSync(filePath, imgBuffer);

    // Add to manifest
    manifest.cooking[name] = [`cooking/${name}/Icon Image.webp`];

    downloaded++;
    console.log(`  ✓ ${name} (${imgBuffer.length} bytes)`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    failed++;
  }
}

// Save updated manifest
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
console.log(`Total cooking entries in manifest: ${Object.keys(manifest.cooking).length}`);
