#!/usr/bin/env python3
"""
Generate gallery thumbnails + hero variants.

Gallery grid items render at roughly 300-500 CSS px wide, but the source
photos are 6000x4000. Loading the originals for the grid is what made the
page weigh tens of megabytes, so this writes a downscaled copy for `src`
while the original stays as the lightbox target (data-src).

Usage:
    python3 tools/make-thumbs.py            # generate missing thumbs
    python3 tools/make-thumbs.py --force    # regenerate all
"""

import argparse
import glob
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THUMB_DIR = os.path.join(ROOT, "Asset", "Thumb")
THUMB_WIDTH = 800

# Quality is category-aware. Poster/graphic-design art carries fine text and
# hairline strokes that show lossy artifacts long before photos do, but there
# are far fewer of them, so the extra bytes are cheap.
QUALITY_DEFAULT = 72
QUALITY_GRAPHIC = 80
GRAPHIC_DIRS = ("Design", "Game")


def quality_for(rel_path: str) -> int:
    return QUALITY_GRAPHIC if any(d in rel_path for d in GRAPHIC_DIRS) else QUALITY_DEFAULT

# The hero is a full-bleed background, so it needs its own wider variants
# instead of a 800px gallery thumb.
HERO_SRC = os.path.join(ROOT, "Asset", "Home", "Hero.webp")
HERO_WIDTHS = [640, 1280, 1920]


def save_webp(img: Image.Image, dest: str, quality: int) -> int:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    img.save(dest, "WEBP", quality=quality, method=6)
    return os.path.getsize(dest)


def make_thumb(src: str, force: bool) -> None:
    # Mirror the path relative to Asset/, so thumbnails land in
    # Asset/Thumb/Gallery/... rather than Asset/Thumb/Asset/Gallery/...
    rel = os.path.relpath(src, os.path.join(ROOT, "Asset"))
    dest = os.path.join(THUMB_DIR, rel)
    if os.path.exists(dest) and not force:
        return
    quality = quality_for(rel)
    with Image.open(src) as im:
        if im.width <= THUMB_WIDTH:
            # Already small enough; copy rather than upscale.
            im.save(dest, "WEBP", quality=quality, method=6)
            return
        ratio = THUMB_WIDTH / im.width
        out = im.resize((THUMB_WIDTH, round(im.height * ratio)), Image.LANCZOS)
        save_webp(out, dest, quality)


def make_hero(force: bool) -> None:
    if not os.path.exists(HERO_SRC):
        return
    out_dir = os.path.join(ROOT, "Asset", "Home")
    with Image.open(HERO_SRC) as im:
        for w in HERO_WIDTHS:
            dest = os.path.join(out_dir, f"Hero-{w}.webp")
            if os.path.exists(dest) and not force:
                continue
            if im.width <= w:
                continue
            ratio = w / im.width
            out = im.resize((w, round(im.height * ratio)), Image.LANCZOS)
            size = save_webp(out, dest, quality=78)
            print(f"  hero {w}px -> {size/1024:.0f} KB")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="regenerate existing thumbs")
    args = ap.parse_args()

    generated_root = os.path.join(ROOT, "Asset", "Thumb") + os.sep

    def is_source(p: str) -> bool:
        # Skip only our own generated thumbs. Matching on a bare "Thumb"
        # segment would also drop Asset/Gallery/Video/Thumb/, which holds
        # hand-made poster frames for the video items.
        if p.startswith(generated_root):
            return False
        return "Hero" not in os.path.basename(p)

    sources = sorted(
        p
        for p in glob.glob(os.path.join(ROOT, "Asset", "**", "*.webp"), recursive=True)
        if is_source(p)
    )

    total_src = total_thumb = 0
    count = 0
    for src in sources:
        total_src += os.path.getsize(src)
        make_thumb(src, args.force)
        rel = os.path.relpath(src, os.path.join(ROOT, "Asset"))
        dest = os.path.join(THUMB_DIR, rel)
        if os.path.exists(dest):
            total_thumb += os.path.getsize(dest)
            count += 1

    print(f"thumbs: {count}/{len(sources)}  "
          f"source {total_src/1024/1024:.1f} MB -> thumbs {total_thumb/1024/1024:.1f} MB")
    print("hero variants:")
    make_hero(args.force)
    return 0


if __name__ == "__main__":
    sys.exit(main())
