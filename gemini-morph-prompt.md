# Prompt for Gemini — morph frame sequences for the Helson & Luna invitation film

Paste everything below the line into Gemini and attach all five images
(beach piggyback, Perth grass, family with toddler, family portrait in the field, and the H&L logo).

---

You are a film compositor and matte painter working on an interactive wedding invitation
that plays as one continuous camera move. I am attaching real photographs of the same
couple, Helson and Luna, taken years apart. I need you to generate **in-between frames**
that morph one photograph into the next, so that on a website the scroll can scrub through
them and the two photographs appear to be a single unbroken shot.

## What I need

Four separate frame sequences. Treat each as a camera move plus a dissolve of the
environment, not as a slideshow.

| Sequence | From | To | The move |
|---|---|---|---|
| morph1 | Beach piggyback | Perth grass path | Camera pushes past the couple, sky and sea give way to blue sky and low green scrub; the couple stay near the centre and re-form in their new pose |
| morph2 | Perth grass path | Family with toddler in hats | Camera drifts in and down; open grass becomes the overcast day, a third small figure resolves between them |
| morph3 | Family with toddler | Family portrait in the tall field | Camera pulls back; the toddler grows into the young girl, the field deepens, warm late light comes up |
| morph4 | Family portrait in the field | Beach piggyback | Camera lifts and pulls away, the field softens into sand and sea, closing the loop back to the first image |

## Rules that matter most

1. **The faces must stay exactly as photographed. Do not redraw, re-render, restyle,
   beautify, age, slim or "improve" any face — theirs or the child's.** Treat every face in
   the attached photographs as a locked plate: you may warp, move, scale, light and blur it,
   but never regenerate it. It must be recognisably the same two people, and the same girl, in
   every single frame. This outranks every other instruction here.
   - If a face cannot be held identical through part of a morph, hide it for those frames
     instead — motion blur, a turn away from camera, hair or a hat across it, shallow focus, a
     light flare passing over. A hidden face is acceptable. A slightly different face is not.
   - If you must choose between a smoother morph and an identical face, keep the face and make
     the camera move smaller.
2. **Frame 1 of each sequence must be a pixel-faithful copy of the source photograph, and
   the final frame a pixel-faithful copy of the destination photograph.** The website hands
   off to the real photo at both ends, so any drift at the ends will show as a jump.
3. **One continuous camera.** No cuts, no flashes, no wipes. Each frame should look like the
   next 1/24 of a second of the same shot.
4. **Middle frames may be abstract.** Around frames 10–15 it is fine for the image to become
   light, haze, bokeh and shape — that is where the two worlds trade places, and it is the
   safest place to carry the faces through hidden.

## Technical specs

- 24 frames per sequence, numbered in order.
- 1400 × 1750 px, 4:5 portrait, every frame identical in size. (The film is mobile-first;
  portrait is the primary crop.)
- Consistent grade across all frames and all four sequences: **pale warm blush monochrome** —
  almost no colour saturation, a soft rose-beige cast, lifted blacks, ivory highlights,
  low contrast, gentle film grain, slight bloom in the highlights. Think faded film
  photograph on warm ivory paper, not high-contrast black and white.
- No text, no logos, no watermarks, no borders, no vignette burned into the frames.
- No AI-typical face changes: no smoothed skin, no reshaped jaw or nose, no whitened teeth, no
  added or removed facial hair, no changed eye shape or colour, no changed hairline.
- File names exactly: `morph1-01.jpg` … `morph1-24.jpg`, `morph2-01.jpg` … and so on.

## Also, from the logo image

Produce one extra asset: `crest-loop-01.png` … `crest-loop-16.png` — 16 frames, 1200 × 1200 px,
transparent background, in which the floral crest from the attached logo assembles itself:
the gold frame and monogram drawn in first, then the flowers and crystals settling into
place around it. Same pale blush grade as the photographs. No text in any frame — leave out
the names and the date line entirely.

## Deliver

All 96 photographic frames plus the 16 crest frames, as individual image files with the
names above.
