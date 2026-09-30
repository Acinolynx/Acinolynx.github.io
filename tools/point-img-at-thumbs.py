#!/usr/bin/env python3
"""
Point <img src> at thumbnails and stamp intrinsic width/height.

Only `src` is rewritten to Asset/Thumb/...; `data-src` is left alone because
that is the lightbox target and must keep pointing at the full-size original.

Adding width/height alongside the existing CSS (object-fit, fixed grid rows)
removes the layout shift that came from images arriving with no intrinsic size.

Usage:
    python3 tools/point-img-at-thumbs.py [--dry-run]
"""

import argparse
import os
import re
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THUMB_ROOT = os.path.join(ROOT, "Asset", "Thumb")

# Matches src="Asset/..." but never data-src="..." (the -? guard).
SRC_RE = re.compile(r'(?<![-\w])src="(Asset/[^"]+)"')

# alt text derived from the asset path, used only where alt is missing
ALT_RULES = [
    (re.compile(r"Photography/Nature"), "Nature and landscape photography"),
    (re.compile(r"Photography/Portrait"), "Portrait photography"),
    (re.compile(r"Photography/Street"), "Street photography"),
    (re.compile(r"Photography/Random"), "Photography"),
    (re.compile(r"Video/Thumb"), "Video editing thumbnail"),
    (re.compile(r"/Game/"), "Game artwork"),
    (re.compile(r"/Design/"), "Graphic design work"),
]


def guess_alt(path: str) -> str:
    for pattern, text in ALT_RULES:
        if pattern.search(path):
            return text
    return "Portfolio work"


def thumb_path(asset_path: str) -> str:
    rel = os.path.relpath(asset_path, "Asset")
    return f"Asset/Thumb/{rel}".replace("\\", "/")


def dimensions(thumb_file: str):
    try:
        with Image.open(os.path.join(ROOT, thumb_file)) as im:
            return im.width, im.height
    except OSError:
        return None


def insert_before_close(tag: str, extra: str) -> str:
    """Insert attributes just before the tag's closing bracket.

    Handles both `<img ...>` and the XHTML form `<img ... />`, which appears
    throughout gallery.html.
    """
    body = tag[:-1].rstrip()  # drop the final '>'
    if body.endswith("/"):  # self-closing: keep the slash last
        body = body[:-1].rstrip()
        return f"{body}{extra} />"
    return f"{body}{extra}>"


def process(path: str, dry_run: bool) -> tuple[int, int, int]:
    full = os.path.join(ROOT, path)
    with open(full, encoding="utf-8") as fh:
        text = fh.read()

    stats = {"thumb": 0, "dim": 0, "alt": 0}

    def replace(match: re.Match) -> str:
        asset = match.group(1)
        thumb = thumb_path(asset)
        if not os.path.exists(os.path.join(ROOT, thumb)):
            return match.group(0)  # no thumbnail, leave as-is
        stats["thumb"] += 1
        return f'src="{thumb}"'

    text = SRC_RE.sub(replace, text)

    # Stamp width/height on the img tags we just rewrote.
    def add_dims(match: re.Match) -> str:
        tag = match.group(0)
        if "width=" in tag:
            return tag
        src = re.search(r'src="([^"]+)"', tag)
        if not src or not src.group(1).startswith("Asset/Thumb/"):
            return tag
        dims = dimensions(src.group(1))
        if not dims:
            return tag
        w, h = dims
        stats["dim"] += 1
        return insert_before_close(tag, f' width="{w}" height="{h}"')

    text = re.sub(r"<img\b[^>]*?/?>", add_dims, text, flags=re.S)

    # Fill in alt on images that lack it.
    def add_alt(match: re.Match) -> str:
        tag = match.group(0)
        if "alt=" in tag:
            return tag
        src = re.search(r'src="([^"]+)"', tag)
        if not src:
            return tag
        stats["alt"] += 1
        return insert_before_close(tag, f' alt="{guess_alt(src.group(1))}"')

    text = re.sub(r"<img\b[^>]*?/?>", add_alt, text, flags=re.S)

    if text != open(full, encoding="utf-8").read() and not dry_run:
        with open(full, "w", encoding="utf-8", newline="") as fh:
            fh.write(text)
    return stats["thumb"], stats["dim"], stats["alt"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    for path in ("index.html", "gallery.html"):
        t, d, a = process(path, args.dry_run)
        print(f"{path:14s} -> {t:3d} src ke thumbnail, {d:3d} +width/height, {a:3d} +alt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
