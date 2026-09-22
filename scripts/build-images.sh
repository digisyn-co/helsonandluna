#!/usr/bin/env bash
# Builds web-ready images from the original photo shoot.
#   pnpm images            (source defaults to the KINGSTON drive)
#   PHOTO_SRC=/path pnpm images
# Output: public/images/<name>-<width>.{avif,webp}. Metadata (EXIF/GPS) is stripped.
# Originals are never modified or copied into the repo.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${PHOTO_SRC:-/Volumes/KINGSTON/Helson and Luna}"
OUT="$ROOT/public/images"
mkdir -p "$OUT"
command -v magick >/dev/null || { echo "ImageMagick 7 required (brew install imagemagick)"; exit 1; }

# name:source-file  (selection is documented in docs/assets.md)
PHOTOS=(
  "walk-away:AR403659.jpg"
  "turned-together:AR403649.jpg"
  "kneeling-candid:AR403640.jpg"
  "family-kneeling:AR403618.jpg"
  "father-daughter-hug:AR403708.jpg"
  "mother-daughter-embrace:AR506280.jpg"
  "daughter-laughing:AR506257.jpg"
  "family-laughing:AR506303.jpg"
  "twirl:AR403797.jpg"
  "family-backlit:AR506285.jpg"
)
WIDTHS=(640 960 1440 2048)

export_one() { # src name
  local src="$1" name="$2"
  for w in "${WIDTHS[@]}"; do
    [ -f "$OUT/$name-$w.avif" ] && [ "$OUT/$name-$w.avif" -nt "$src" ] && continue
    magick "$src" -auto-orient -strip -resize "${w}x${w}>" -colorspace sRGB -quality 52 "$OUT/$name-$w.avif"
    magick "$src" -auto-orient -strip -resize "${w}x${w}>" -colorspace sRGB -quality 74 "$OUT/$name-$w.webp"
  done
  echo "  $name"
}

echo "Photos from: $SRC"
for entry in "${PHOTOS[@]}"; do
  export_one "$SRC/${entry#*:}" "${entry%%:*}"
done

# Real couple photos from the August site (digisyn-co/helsonandluna), originals in docs/reference/august.
export_one "$ROOT/docs/reference/august/couple-beach.jpg" "couple-beach"
export_one "$ROOT/docs/reference/august/couple-coast.jpg" "couple-coast"
export_one "$ROOT/docs/reference/august/family-selfie.jpg" "family-selfie"
# The meadow portrait with the flower basket, chosen by the couple for Family (2026-09-22).
export_one "$ROOT/docs/reference/family-meadow.jpg" "family-meadow"

# Monogram emblem: the transparent "HELSON & LUNA" artwork, exact pixels, cropped above
# its printed text line (names are set as live type; its "12.12 2026" date is wrong —
# the wedding is December 17, 2026; see docs/content.md). Alpha is preserved.
MONO="$ROOT/docs/reference/august/monogram-transparent.png"
for w in 320 640 931; do
  magick "$MONO" -strip -crop 931x822+44+53 +repage -resize "${w}x" -quality 72 "$OUT/monogram-$w.avif"
  magick "$MONO" -strip -crop 931x822+44+53 +repage -resize "${w}x" -quality 90 "$OUT/monogram-$w.webp"
done
echo "  monogram"
du -sh "$OUT"
