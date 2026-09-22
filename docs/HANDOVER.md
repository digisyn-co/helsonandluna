# Hand-over — Helson & Luna invitation

Shareable version (non-technical): https://claude.ai/code/artifact/7516500e-bf0e-4c39-a2e6-81232e648f84
Last updated 2026-09-22. No secrets live in this repo; see "Access" for where they are.

## Status
Live at https://helsonandluna.vercel.app. Scroll-driven 3D invitation, mobile-first, with a working RSVP that writes to a Google Sheet. Every fact renders from `src/content/` (mirrors `docs/content.md`).

## Before sending to guests
- [ ] Couple proofreads every name and fact (`docs/content.md`, entourage in `src/content/entourage.ts`).
- [ ] Open the link on 2–3 real phones (incl. one older Android) and scroll end to end.
- [ ] Turn on the OS "Reduce motion" setting and scroll once (not re-tested since the dissolve rework).
- [ ] Submit one RSVP, confirm the row appears, then delete it and the earlier test row.
- [ ] Delete the unused Apps Script project under the other Google account.

## Access
| What | Where |
|---|---|
| Code | https://github.com/digisyn-co/helsonandluna (`main` auto-deploys) |
| Hosting | Vercel project `helsonandluna` |
| RSVP sheet + Apps Script | `integrations/rsvp-sheet/README.md` (links, owner jim@digisyn.co) |
| Secrets | Vercel env (`RSVP_WEBHOOK_URL`, `RSVP_WEBHOOK_SECRET`, Production, encrypted) and Apps Script *Script properties* (`RSVP_SECRET`, `SHEET_ID`) |

## RSVP flow
Form (`08-details`) → `POST /api/rsvp` (validate, honeypot) → Apps Script `/exec` with `secret` in the JSON body (Apps Script can't read headers) → `LockService` + formula-injection guard → append to the "RSVPs" tab. No webhook configured → honest 503; Apps Script `{ok:false}` → 502. To rotate the secret, change both sides, then redeploy Vercel.

## How it's built
- Next.js 16 (App Router) · React 19.2 (R3F 9.7 needs <19.3) · three 0.186 · drei · GSAP 3.15 · Lenis · pnpm · Node 22.
- Story: invitation → beginning → two-of-us → family → promise → entourage (flow) → ceremony → celebration → details (flow, RSVP) → closing. Lengths in `src/content/scenes.ts`.
- `animation/sceneManager.ts` is the only scroll reader. Pinned chapters are fixed `.chapter__pin` layers cross-faded by `layerOpacity()` (`animation/pin.ts`); flow chapters scroll normally and their neighbours fade over 0.35 screens (`fadeScreens`).
- Theme sampled from the invitation artwork (periwinkle tokens in `styles/tokens.css`, per-chapter `animation/moods.ts`, artwork cloud texture, `CardFrame` gold hairline).
- Loader waits only for fonts + monogram (4 s fail-safe), never WebGL. three.js is code-split; initial JS ≈ 222 KB gz.
- Flow clips (`public/clips`, ~2 MB total) are optional; skipped for reduced motion, low power and the low tier. `?tier=low|mid|high` and `?reduced` force modes for QA.
- QA: `node scripts/qa-screenshots.mjs` (`QA_VIEWPORTS`, `QA_FRAMES`, `QA_SWEEP=0.5`).

## Common tasks
| Task | How |
|---|---|
| Change a fact or name | Edit `src/content/*.ts` and `docs/content.md`, push to `main` |
| Swap a photo | Source on the KINGSTON drive → `pnpm images` |
| Update Apps Script | Paste `Code.js`, save, Manage deployments → edit → New version (same URL) |
| Roll back the site | Vercel → Deployments → previous → Promote |

## Known limitations and next steps
- Not tested on physical iOS/Android devices; reduced-motion not re-tested after the dissolve change.
- Chapel clip is generic AI footage, not St. Clement's. No music by design.
- Spline installed but unused (rings built in R3F).
- Next: custom domain, Open Graph share image, "RSVP by" date once the couple sets one.
