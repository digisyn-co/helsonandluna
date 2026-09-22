#!/usr/bin/env bash
# Builds the looping church background for The Ceremony from the drone footage.
#   CHURCH_SRC=/path/to/drone.mp4 ./scripts/build-church-clip.sh
# Output: public/clips/church.mp4 (+ church-poster.webp). The original is never copied
# into the repo.
#
# Uses only the church shots (0–35.2 s: front approach, side and roof, front again); the
# street and city shots after that are cut. Muted, 540 px wide, 24 fps, lightly denoised
# (it sits under a legibility shade), graded like the site's photos, and faded in/out to
# the page's deepest periwinkle so the loop seam is soft.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${CHURCH_SRC:?set CHURCH_SRC to the original drone video}"
OUT="$ROOT/public/clips"
LEN=35.2
GRADE="eq=saturation=0.82:brightness=-0.03:contrast=1.03"
command -v ffmpeg >/dev/null || { echo "ffmpeg required (brew install ffmpeg)"; exit 1; }

ffmpeg -v error -y -ss 0 -t "$LEN" -i "$SRC" -an \
  -vf "fps=24,scale=540:-2:flags=lanczos,hqdn3d=2:2:4:4,$GRADE,fade=t=in:st=0:d=0.6:color=0x4c5172,fade=t=out:st=$(echo "$LEN - 0.7" | bc):d=0.7:color=0x4c5172,format=yuv420p" \
  -c:v libx264 -preset veryslow -crf 34 -profile:v high -movflags +faststart "$OUT/church.mp4"

# Poster = the still shown before playback, and the whole background for reduced motion,
# data saver and the low tier: the front of the church from the first shot.
ffmpeg -v error -y -ss 12 -i "$SRC" -frames:v 1 -vf "scale=720:-2:flags=lanczos,$GRADE" -c:v libwebp -quality 72 "$OUT/church-poster.webp"

ls -lh "$OUT/church.mp4" "$OUT/church-poster.webp"
