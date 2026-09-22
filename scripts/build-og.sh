#!/usr/bin/env bash
# Builds the link-preview image (Open Graph) shown when the invitation link is shared
# in Messenger, WhatsApp, iMessage etc.
#   pnpm og
# Output: src/app/opengraph-image.jpg (1200×630). Next.js adds the og:image tags itself.
# Uses only the artwork (monogram + cloud paper) and confirmed facts: names, date, city.
# If the date or city in src/content/wedding.ts changes, update the lines below and re-run.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG="$ROOT/public/images"
OUT="$ROOT/src/app/opengraph-image.jpg"
command -v magick >/dev/null || { echo "ImageMagick 7 required (brew install imagemagick)"; exit 1; }

NAMES="Helson & Luna"
DATE="Thursday, December 17, 2026"
PLACE="Iloilo City, Philippines"
SERIF="/System/Library/Fonts/Supplemental/Didot.ttc"
[ -f "$SERIF" ] || SERIF="Times-Roman"

W=1200 H=630
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# Paper: the site's sky gradient + blush glow, cloud texture in soft-light, periwinkle vignette.
# (ImageMagick's soft-light over-brightens this texture, so the clouds are added around mid-grey.)
magick -size ${W}x${H} gradient:'#8b8ea8'-'#646987' \
  \( -size ${W}x${H} xc:none -fill 'rgba(198,179,184,0.30)' -draw "ellipse 220,60 520,260 0,360" -blur 0x110 \) -compose over -composite \
  \( "$IMG/sky-clouds.webp" -resize ${W}x${H}^ -gravity center -extent ${W}x${H} -alpha off \
     -evaluate subtract 50% -evaluate multiply 0.6 \) -compose plus -composite -clamp \
  \( +clone -background '#363a5a' -vignette 0x200+0+0 \) -compose blend -define compose:args=45 -composite \
  "$TMP/paper.png"

# Gold hairline frame, as on every screen of the site.
magick "$TMP/paper.png" -fill none -stroke 'rgba(226,200,150,0.6)' -strokewidth 1.5 \
  -draw "rectangle 18,18 $((W-19)),$((H-19))" "$TMP/framed.png"

# Monogram (exact artwork) on the left, type on the right.
magick "$TMP/framed.png" \
  \( "$IMG/monogram-931.webp" -resize x520 \) -gravity west -geometry +80+4 -compose over -composite \
  -gravity northwest -font "$SERIF" -fill '#fffaf2' -stroke none \
  -pointsize 66 -annotate +660+200 "$NAMES" \
  -fill none -stroke '#d4b483' -strokewidth 1.2 -draw "line 664,296 1080,296" -stroke none \
  -fill 'rgba(255,250,242,0.92)' -pointsize 32 -annotate +664+330 "$DATE" \
  -fill 'rgba(255,250,242,0.78)' -pointsize 26 -annotate +664+378 "$PLACE" \
  -fill '#efdcb7' -pointsize 20 -kerning 5 -annotate +664+456 "YOU ARE INVITED" \
  -strip -quality 86 -sampling-factor 4:2:0 "$OUT"

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
