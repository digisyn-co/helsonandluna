@AGENTS.md

# Helson & Luna — cinematic wedding invitation

Mobile-first, scroll-driven 3D invitation. Next.js 16 (App Router) · React 19.2 · R3F 9 + drei · GSAP 3.15 (SplitText, DrawSVG) · Lenis 1.3 · pnpm.

## Commands
`pnpm dev` (port 3200) · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm images` (rebuild web images from the photo shoot on the KINGSTON drive) · `node scripts/qa-screenshots.mjs` (QA screenshots at 5 viewports → docs/qa/)

## Rules (from the brief — these win)
- **Mobile is the product.** Check 390×844 first, then 375 / 393 / 430 and 1440×900.
- **Never invent wedding facts.** Everything renders from `src/content/`, mirroring `docs/content.md`. Unknowns stay `null` / `TODO(content)`.
- **The monogram is exact.** Only the artwork's printed text line is cropped (outdated names/year). Animate around it; never redraw it.
- **Information never waits on animation.** Details/RSVP never uses `[data-reveal]`; everything works without WebGL (`?nowebgl`) and with reduced motion (`?reduced`). `?lowpower` forces the low tier; `?tier=low|medium|high` pins the tier for QA.
- **People imagery = real photos only** (pro shoot + August couple photos). AI imagery is limited to objects and atmosphere: the rings fallback still and the four Google Flow transition clips in `public/clips` (see docs/assets.md). Clips are optional enhancements: never make information depend on them.
- Don't claim a Spline scene or MCP exists unless created and verified. The Spline MCP is **not** installed; 3D uses the R3F fallback.

## Architecture
- `src/animation/sceneManager.ts` — the ONLY scroll reader. Scenes register via `useScene` / `useChapterTimeline` (scrub timeline + one-shot reveal). Timings in `animation/tokens.ts` + `styles/tokens.css`; per-chapter atmosphere in `animation/moods.ts`.
- `src/scenes/NN-name/` — one folder per chapter; order, lengths (screens) and `flow` flags live in `content/scenes.ts`. Story order: Invitation → Beginning → Two of Us → Family → Promise → Entourage → Ceremony → Celebration → Details → Closing.
- Pinned chapters are **fixed layers that cross-dissolve** (`layerOpacity` in `animation/pin.ts`, applied by `useChapterTimeline`); sections only provide scroll distance. `flow` chapters (Entourage, Details) scroll normally and their neighbours fade within a third of a screen of them. Every chapter's first frame (t=0) must be non-empty, because it is seen while dissolving in.
- Theme = the artwork's paper: periwinkle moods (`animation/moods.ts`), the artwork's own cloud texture (`public/images/sky-clouds.webp`, luminance-only), gold `CardFrame`. Legibility shading uses `--shade-rgb` (deep periwinkle, never black).
- The loader waits for fonts + monogram only, never for WebGL.
- `src/components/cinematic/Stage.tsx` — one shared transparent canvas (haze + particles; per-scene 3D lazy-mounted near its chapter). Sky colour is CSS (`Sky.tsx`), so the no-WebGL fallback keeps the world.
- DOM code must never import three (keeps it out of the initial bundle — verify after builds).
- GSAP owns the transforms of animated elements: don't centre them with CSS `translate`/`transform`; use offsets or margins.
- Type reveals split text only after `document.fonts.ready` and revert the split when done.

## Open items
See `docs/content.md` → "Still open". Deployed at https://helsonandluna.vercel.app (Vercel project `helsonandluna`, auto-deploys from `digisyn-co/helsonandluna` main; `vercel.json` pins the Next.js preset). RSVPs go to a Google Sheet via Apps Script; see `integrations/rsvp-sheet/README.md`.
