#!/usr/bin/env python3
"""
Resize and optimize ACNH assets for web use.
Reads from public/assets/ (originals preserved).
Writes to public/assets-web/ (optimized WebP copies).

Usage: python3 scripts/optimize-assets.py
"""

import os
import json
from pathlib import Path
from PIL import Image

SRC = Path("public/assets")
DST = Path("public/assets-web")
MANIFEST_SRC = SRC / "manifest.json"
MANIFEST_DST = DST / "manifest.json"

# Target sizes per image type (width=height, square)
SIZE_MAP = {
    "Icon Image": 64,
    "Critterpedia Image": 128,    # wider, keep aspect ratio
    "Furniture Image": 64,
    "Album Image": 128,
    "Image": 64,
    "Photo Image": 96,
    "House Image": 96,
    "Closet Image": 64,
    "Storage Image": 64,
    "Framed Image": 96,
    "Source Notes": None,          # skip these
}
DEFAULT_SIZE = 64

def get_target_size(filename):
    """Determine target size from filename."""
    stem = Path(filename).stem
    if stem in SIZE_MAP:
        return SIZE_MAP[stem]
    return DEFAULT_SIZE

def optimize_image(src_path, dst_path, target_size):
    """Resize and convert a single image to optimized WebP."""
    if target_size is None:
        return False
    try:
        with Image.open(src_path) as img:
            img = img.convert("RGBA")
            # Resize preserving aspect ratio, fit within target_size box
            img.thumbnail((target_size, target_size), Image.LANCZOS)
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            # Save as WebP for smaller size
            webp_path = dst_path.with_suffix(".webp")
            img.save(webp_path, "WEBP", quality=85, method=6)
            return True
    except Exception as e:
        print(f"  WARN: {src_path}: {e}")
        return False

def main():
    if not MANIFEST_SRC.exists():
        print(f"ERROR: {MANIFEST_SRC} not found. Run from project root.")
        return

    with open(MANIFEST_SRC) as f:
        manifest = json.load(f)

    # Build new manifest with .webp extensions
    web_manifest = {}
    total = 0
    converted = 0
    skipped = 0

    for category, items in manifest.items():
        web_manifest[category] = {}
        print(f"Processing: {category} ({len(items)} items)")
        for item_name, files in items.items():
            web_files = []
            for rel_path in files:
                total += 1
                src_path = SRC / rel_path
                target_size = get_target_size(Path(rel_path).name)
                if target_size is None:
                    skipped += 1
                    continue
                dst_rel = Path(rel_path).with_suffix(".webp")
                dst_path = DST / dst_rel
                if optimize_image(src_path, dst_path, target_size):
                    web_files.append(str(dst_rel))
                    converted += 1
            if web_files:
                web_manifest[category][item_name] = web_files

    # Write web manifest
    DST.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_DST, "w") as f:
        json.dump(web_manifest, f, indent=2, ensure_ascii=False)

    print(f"\nDone! {converted}/{total} converted, {skipped} skipped")
    print(f"Web manifest: {MANIFEST_DST}")
    print(f"Web assets size: {sum(f.stat().st_size for f in DST.rglob('*.webp')) / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
