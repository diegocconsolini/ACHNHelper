// Download cooking recipe images from Nookipedia API
// Uses pre-extracted name list from /tmp/cooking_names.json
// Stores as PNG in public/assets-web/cooking/{recipe_name}/Icon Image.webp

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const API_KEY = process.env.NOOKIPEDIA_API_KEY;
if (!API_KEY) {
  console.error('Error: NOOKIPEDIA_API_KEY must be set');
  console.error('Run: node --env-file=.env.local scripts/download-cooking-images.mjs');
  process.exit(1);
}

// Load cooking recipe names
const cookingNames = JSON.parse(readFileSync('/tmp/cooking_names.json', 'utf-8'));
console.log(`Found ${cookingNames.length} cooking recipes`);

const assetsDir = join(import.meta.dirname, '..', 'public', 'assets-web', 'cooking');
mkdirSync(assetsDir, { recursive: true });

const manifestPath = join(import.meta.dirname, '..', 'public', 'assets-web', 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
if (!manifest.cooking) manifest.cooking = {};

let downloaded = 0;
let skipped = 0;
let failed = 0;
const failures = [];

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
      headers: { 'X-API-KEY': API_KEY, 'Accept-Version': '1.7.0' },
    });

    if (!res.ok) {
      console.log(`  ✗ ${name}: API ${res.status}`);
      failures.push(name);
      failed++;
      continue;
    }

    const data = await res.json();
    const imageUrl = data.image_url;

    if (!imageUrl) {
      console.log(`  ✗ ${name}: no image_url`);
      failures.push(name);
      failed++;
      continue;
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.log(`  ✗ ${name}: image download ${imgRes.status}`);
      failures.push(name);
      failed++;
      continue;
    }

    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, imgBuffer);

    manifest.cooking[name] = [`cooking/${name}/Icon Image.webp`];

    downloaded++;
    console.log(`  ✓ ${name} (${imgBuffer.length} bytes)`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    failures.push(name);
    failed++;
  }
}

// Save updated manifest
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
console.log(`Total cooking entries in manifest: ${Object.keys(manifest.cooking).length}`);
if (failures.length > 0) {
  console.log('\nFailed recipes:');
  failures.forEach(n => console.log(`  - ${n}`));
}
