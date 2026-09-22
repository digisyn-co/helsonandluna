# Helson & Luna — Asset inventory

Audited 2026-09-22. Sources:
- **Pro shoot:** `/Volumes/KINGSTON/Helson and Luna/AR*.jpg`, 52 photos. Originals stay there and aren't copied into the repo at full size.
- **Repo:** `assets/` (5 images, 8 videos). `uploads/` holds byte-identical duplicates plus 3 screenshots.
- **Monogram / theme artwork:** `assets/monogram.jpeg` = `Helson and Luna.png` (same artwork, 1254×1254). Copied to `docs/reference/theme-artwork.png`.

## Key findings
1. **The real family shoot has no couple-only photos.** Every AR frame includes the daughter. Scene 02 "The Two of Us" can use AR403649 or AR506250 (the closest to intimate moments), or the couple-only repo image. See point 2.
2. **The repo's people videos appear to be AI-generated.** The man in `v-couple.mp4` and `v-family.mp4` (bald, clean-shaven, linen suit) was judged not to be the father in the AR shoot (cap, white shirt). ✅ **Correction (2026-09-22):** `family-field.jpeg` (the meadow photo with the flower basket) is a **real photo of the family**, confirmed by the client; the audit's doubt about it was wrong. It is now the Family hero (`family-meadow`, original in `docs/reference/family-meadow.jpg`). The `uploads/` filenames confirm AI origin for the monogram (`ChatGPT_Image_…`) and the videos (prompt-style names). **Recommendation:** use only real AR photos for people, and treat AI imagery as objects and atmosphere only (shoes, rings, sky, florals). **Needs confirmation.**
3. **No real ring photography exists**; rings are rendered in 3D. **Church: real drone footage** supplied 2026-09-22 (55 s, 720×1280, watermarked "ORIGSTUDIO2026") now runs behind 05 The Ceremony (`church.mp4`, below). `TODO(content)`: confirm usage rights with the videographer (or get an unwatermarked export) and that it shows St. Clement's.
4. **Colour world mismatch:** the AR shoot is bright, warm golden-hour bushland (greens and ochres). The art direction is dusty blue, midnight and champagne gold. Photos need one consistent grade: a lifted-black blue-shadow split-tone plus a vignette, applied in the image pipeline, never per-photo by hand.
5. **Weight:** the AR originals are 60 MP and 5–10 MB each. Each selected photo is exported as AVIF + WebP at 640 / 960 / 1440 / 2048 widths, with a hand-set focal point. Target: under 150 KB per mobile image.

## Monogram and theme artwork
| File | Type | Dimensions | Size | Subject | Notes |
|---|---|---|---|---|---|
| `assets/monogram.jpeg` (= `Helson and Luna.png`, 2.0 MB PNG) | AI artwork (JPEG/PNG) | 1254×1254, 1:1 | 609 KB | Gold "HL" monogram in an ornate oval frame with crystals, blush roses and a bow on a dusty-blue field, with the text **"LUNA & HELSON · 12·17·2024"** | ⚠ The embedded text conflicts with the site (name order, **year**). The artwork is flat, so the monogram can't be lit in real 3D; the light sweep and crystal glints are done as masked 2D/shader passes over it, without altering it. Needs a transparent or clean cut-out of the emblem (see content conflicts) |

## Repo still images (probably AI; see finding 2)
| File | Type | Dimensions | Aspect | Size | Subject | Focal point | Best scene | Mobile crop | Animation idea |
|---|---|---|---|---|---|---|---|---|---|
| `assets/baby-shoes.jpeg` | image | 2048×1536 | 4:3 | 345 KB | Pink rosette baby shoes held in two hands | shoes centre | 04 Family ("the smallest pair of shoes") | 4:5 centred | macro push-in, soft DOF |
| `assets/couple-table.jpeg` | image | 1086×1448 | 3:4 | 273 KB | Couple at a candlelit garden table (the people don't match the AR shoot) | faces upper-third | 02 only if confirmed as real | native | — |
| `assets/family-field.jpeg` | **real photo** (confirmed 2026-09-22) | 1536×1024 | 3:2 | 246 KB | The family seated in a meadow with a flower basket | faces centre (`50% 40%`) | 04 Family hero (`family-meadow`) | 3:2 frame, all three in shot | slow settle as the camera arrives |
| `assets/family-path.jpeg` | image | 1360×2040 | 2:3 | 344 KB | Family walking a trail, small figures | figures lower-centre | — (replace with AR403659) | — | — |

## Videos: decisions (source files are not deleted; decisions recorded here)
All 8 are AI-generated, 1280×720 landscape, h264, 24 fps, 10 s. That's 41.6 MB in total, the main reason the current site is heavy. Landscape video also crops poorly on a portrait phone.

| File | Size | Content | Decision | Reason |
|---|---|---|---|---|
| `v-church.mp4` | 8.1 MB | Stone church facade, stained glass, florals | **Remove** as video; **extract 1 still frame** as a fallback texture for 05 only if the couple approves (see finding 3) | Heaviest file; may not be the real venue |
| `v-clouds.mp4` | 6.0 MB | Soft clouds with drifting petals | **Remove**; recreate as a shader haze plus a particle layer | Procedural haze is lighter, loops perfectly, and matches the palette |
| `v-couple.mp4` | 3.4 MB | AI couple at a table | **Remove** | Wrong people |
| `v-family.mp4` | 8.9 MB | AI family walking a garden path | **Remove** | Wrong people |
| `v-garden-rise.mp4` | 5.2 MB | Camera rising over a meadow | **Remove** | Replaced by the scroll-driven camera rise |
| `v-rings.mp4` | 4.4 MB | Two gold rings on a white flower | **Remove**; use as a lighting and material **reference** for the 3D ring scene | Rings become real-time 3D (03 The Promise) |
| `v-shoes.mp4` | 3.2 MB | Baby shoes macro | **Remove**; the still `baby-shoes.jpeg` covers it | Still plus a slow push-in is enough |
| `v-twilight.mp4` | 2.5 MB | Twilight sky with drifting petals | **Re-encode small** (portrait crop 720×1280, ~0.6 MB, AV1/H.264, muted, poster frame) as an **optional** texture for 08 Closing; drop it if the procedural sky reads as well | Closest to the closing mood; not load-critical |

`uploads/` is a duplicate of `assets/` plus 3 design screenshots. It should be removed from the deployed bundle (git history keeps it).

## Pro shoot (52 photos)
Consecutive frames are near-duplicate bursts; "(alt)" rows are backups. Final selection happens in Phase 4; the target is roughly 10–14 photos total across scenes.

| File | Type | Dimensions | Aspect | Size | Subject | Focal point | Best scene | Mobile crop | Animation idea |
|---|---|---|---|---|---|---|---|---|---|
| `AR403618.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.9 MB | Family of three kneeling on trail, all smiling to camera | faces upper-middle (~35% from top) | 04 Family (hero candidate) | 4:5 centred on faces | slow push-in, depth-layer separation |
| `AR403626.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.3 MB | Family kneeling, near-duplicate of 618 | faces upper-middle | 04 Family (alt) | 4:5 centred | — |
| `AR403629.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.3 MB | Family kneeling, near-duplicate | faces upper-middle | 04 Family (alt) | 4:5 centred | — |
| `AR403631.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 9.0 MB | Family kneeling, landscape framing | faces at left-centre, ~30% from top | 04 Family midground layer | portrait crop x≈40% | parallax layer |
| `AR403636.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.6 MB | Family kneeling, landscape, candid laughter | faces left-centre | 04 Family | crop x≈35% | parallax layer |
| `AR403640.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.7 MB | Family kneeling, parents looking at daughter | faces centre-left | 02/04 | crop x≈40% | fragment reveal |
| `AR403644.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.6 MB | Family kneeling, candid | faces centre-left | 04 (alt) | crop x≈40% | — |
| `AR403649.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.5 MB | Family kneeling, parents turned to each other | faces centre-left | 02 The Two of Us (closest to a couple moment) | crop x≈45% | slow drift + gold frame |
| `AR403659.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.9 MB | Mother & daughter walking away down path, backs, big sky | figures lower-centre, small | 01 The Beginning / 08 Closing (sky space) | full portrait, figures bottom third | camera rise into sky |
| `AR403662.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.8 MB | Mother & daughter walking away, near-dup | figures lower-centre | 01/08 (alt) | full portrait | — |
| `AR403668.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 9.7 MB | Mother & daughter walking toward camera holding hands | faces upper-middle | 04 Family / 06 | 4:5, faces at 30% | walk-in parallax |
| `AR403671.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.7 MB | Mother & daughter holding hands, facing each other | faces middle | 04 Family | 4:5 centred | — |
| `AR403673.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 10.0 MB | Mother & daughter hand in hand, laughing | faces upper-middle | 06 Celebration | 4:5 centred | energetic drift |
| `AR403677.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.6 MB | Mother kneels holding daughter's hands | faces middle | 04 Family | 4:5 centred | — |
| `AR403680.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.3 MB | Mother kneels holding daughter's hands, landscape | faces centre | 04 background layer | crop x≈50% | — |
| `AR403688.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.6 MB | Family seated on rock, bush backdrop | faces middle-right | 05/06 context | portrait native | — |
| `AR403690.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.5 MB | Family seated on rock | faces middle | 06 Celebration | 4:5 centred | — |
| `AR403694.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 5.7 MB | Family on rock, tight landscape, candid | faces centre | 06 Celebration (hero candidate) | crop x≈55% | push-in |
| `AR403697.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 8.6 MB | Family on rock, wide with blue sky | figures centre, small | 05 Ceremony atmosphere (sky) | crop x≈50%, sky top | sky-first reveal |
| `AR403699.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.3 MB | Father crouching with daughter, trail | faces middle | 04 Family | 4:5 centred | — |
| `AR403701.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.5 MB | Father & daughter | faces middle | 04 (alt) | 4:5 centred | — |
| `AR403702.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.4 MB | Father & daughter | faces middle | 04 (alt) | 4:5 centred | — |
| `AR403704.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.5 MB | Father & daughter, close moment | faces middle | 04 Family | 4:5 centred | — |
| `AR403706.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.5 MB | Father & daughter embrace | faces middle | 04 Family | 4:5 centred | — |
| `AR403708.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.3 MB | Father–daughter hug on sunlit trail | faces upper-middle | 04 Family (hero candidate) | 4:5, faces 35% | light sweep |
| `AR403710.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.1 MB | Father–daughter hug, near-dup | faces upper-middle | 04 (alt) | 4:5 | — |
| `AR403712.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.1 MB | Father–daughter hug, near-dup | faces upper-middle | 04 (alt) | 4:5 | — |
| `AR403715.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.0 MB | Father–daughter hug, near-dup | faces upper-middle | 04 (alt) | 4:5 | — |
| `AR403778.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.6 MB | Daughter alone on shaded tree-lined path | figure centre, face ~45% | 02/04 transition | portrait native | camera travels down path |
| `AR403794.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.8 MB | Daughter, arms raised, shaded path | figure centre | 06 Celebration | portrait native | — |
| `AR403795.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.8 MB | Daughter, arms raised | figure centre | 06 (alt) | portrait native | — |
| `AR403797.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.9 MB | Daughter twirling in tulle dress | figure centre | 06 Celebration (energy beat) | portrait native | motion-blur reveal |
| `AR506242.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.9 MB | Family kneeling, wider with sky | faces lower-middle | 04 Family | 4:5, faces 55% | — |
| `AR506246.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 6.9 MB | Mother & daughter kneeling, holding hands | faces middle | 04 Family | 4:5 centred | — |
| `AR506250.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 5.1 MB | Mother & daughter, close, laughing, hands joined | faces centre-right | 02/04 intimate beat | crop x≈60% | fragment → full reveal |
| `AR506252.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.0 MB | Mother & daughter kneeling | faces middle | 04 (alt) | 4:5 centred | — |
| `AR506257.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 5.3 MB | Daughter laughing, close-up, mother's arm in foreground | face upper-middle | 04 detail | 4:5, face 35% | — |
| `AR506258.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 5.0 MB | Daughter close-up, landscape | face centre-right | 04 foreground layer | crop x≈62% | — |
| `AR506261.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 5.0 MB | Daughter close-up | face centre-right | 04 (alt) | crop x≈62% | — |
| `AR506263.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 5.0 MB | Daughter close-up, laughing | face centre-right | 04 (alt) | crop x≈62% | — |
| `AR506267.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 8.4 MB | Mother hugging daughter on path | faces middle | 04 Family | 4:5 centred | — |
| `AR506273.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 10.3 MB | Mother hugging daughter | faces middle | 04 (alt) | 4:5 centred | — |
| `AR506278.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 9.5 MB | Mother hugging daughter | faces middle | 04 (alt) | 4:5 centred | — |
| `AR506280.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.1 MB | Mother & daughter embrace, mother smiling to camera | faces upper-middle | 04 Family (hero candidate) | 4:5, faces 35% | — |
| `AR506285.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.7 MB | Family standing on rock, backlit, big trees | figures lower-centre, small | 08 Closing (sky space) | portrait native | camera rise |
| `AR506286.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.8 MB | Family standing, backlit | figures lower-centre | 08 (alt) | portrait native | — |
| `AR506291.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.0 MB | Family standing, sun flare through tree | figures lower-centre | 05 Ceremony light-sweep / 08 | portrait native | flare → transition |
| `AR506295.jpg` | photo (JPEG, pro shoot) | 6336×9504 | 2:3 portrait | 7.1 MB | Family standing, backlit | figures lower-centre | 08 (alt) | portrait native | — |
| `AR506297.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 7.5 MB | Family on rock, backlit, landscape | figures centre-left | 06 Celebration | crop x≈45% | — |
| `AR506301.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 7.1 MB | Father leaning to daughter, mother behind, playful | faces centre | 06 Celebration | crop x≈50% | — |
| `AR506303.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 7.6 MB | Father, daughter, mother kneeling, laughing | faces centre | 06 Celebration (hero candidate) | crop x≈55% | energy lift |
| `AR506307.jpg` | photo (JPEG, pro shoot) | 9504×6336 | 3:2 landscape | 7.2 MB | Family playful, laughing | faces centre-left | 06 (alt) | crop x≈45% | — |
## Transition clips: Google Flow (added 2026-09-22)
Generated in Google Flow with **Veo 3.1 Fast**: 720×1280, 8 s, 9:16, 20 credits each (80 total). Re-encoded for the web to 540×960 H.264, audio removed, faststart, with a WebP poster each. Files are in `public/clips/`.

| Clip | Chapter | Web size | Content | Notes |
|---|---|---|---|---|
| `ring.mp4` | 01 The Beginning | 928 KB | Camera passes through a gold ring into a rose garden at dawn | Replaces the gold-circle aperture while it plays |
| `reflection.mp4` | 03 → 04 | 316 KB | Gold bands on midnight silk; the highlight blooms into golden bokeh | Hands off to the exit flare |
| `church.mp4` + `church-poster.webp` | 05 The Ceremony (looping background) | 2.1 MB + 132 KB | **Real drone footage of the church**: front approach, side and roof, front again (source 0–35.2 s; the street/city shots after that are cut) | Muted, 540 px, 24 fps, graded like the photos, periwinkle fades at the loop seam. Rebuild: `CHURCH_SRC=… ./scripts/build-church-clip.sh`. Plays only while the chapter is within reach; never holds a scene step. Reduced motion / data saver / low tier show the poster still. Replaces the generic AI `chapel.mp4` and the line-art church (both removed). Source watermark "ORIGSTUDIO2026" is kept (not cropped out); `TODO(content)`: confirm rights |
| `twilight.mp4` | 08 The Closing | 366 KB | Rising past treetops into a lavender twilight with petals | Sits behind the monogram |

Clips are an enhancement only (`TransitionClip`). They load when their chapter is near, play once, and are **skipped** for reduced motion, low-power/data-saver and the low tier, where the code-built transition plays instead. QA: `?tier=medium` pins the tier so clips show in headless or hidden browsers.
