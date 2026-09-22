import type { SceneId } from "@/content/scenes";
import { sceneFrames } from "./sceneManager";

/**
 * Per-chapter atmosphere. The world is continuous: each frame blends every chapter's
 * mood weighted by how present it is on screen, so chapters dissolve into each other.
 */
export type Mood = {
  skyTop: string;
  skyBottom: string;
  haze: number;      // 0..1
  rays: number;      // 0..1
  dust: number;      // particle opacity 0..1
  dustMotion: number; // 0 still .. 1 gentle drift
};

/**
 * Every chapter lives in the artwork's world: dusty periwinkle paper (#6c7190–#8a8da6)
 * with warm blush clouds. Moods only shift light and weight; tops are lighter (clouds),
 * bottoms deeper so copy set low on the screen keeps its contrast.
 */
export const MOODS: Record<SceneId, Mood> = {
  invitation: { skyTop: "#8b8ea8", skyBottom: "#646987", haze: 0.35, rays: 0.15, dust: 0.3, dustMotion: 0.2 },
  beginning: { skyTop: "#9094ad", skyBottom: "#666b8a", haze: 0.55, rays: 0.3, dust: 0.35, dustMotion: 0.3 },
  "two-of-us": { skyTop: "#8e91ab", skyBottom: "#646988", haze: 0.5, rays: 0.25, dust: 0.3, dustMotion: 0.3 },
  family: { skyTop: "#9396ae", skyBottom: "#676c8b", haze: 0.55, rays: 0.3, dust: 0.35, dustMotion: 0.35 },
  promise: { skyTop: "#565b7c", skyBottom: "#3f4466", haze: 0.25, rays: 0.05, dust: 0.2, dustMotion: 0.1 },
  entourage: { skyTop: "#7f839f", skyBottom: "#5f6484", haze: 0.3, rays: 0.1, dust: 0.15, dustMotion: 0.15 },
  ceremony: { skyTop: "#979ab1", skyBottom: "#676c8a", haze: 0.6, rays: 0.5, dust: 0.3, dustMotion: 0.25 },
  celebration: { skyTop: "#a09eb4", skyBottom: "#6a6e8c", haze: 0.45, rays: 0.3, dust: 0.6, dustMotion: 0.7 },
  details: { skyTop: "#7b7f9c", skyBottom: "#5c6181", haze: 0.2, rays: 0.0, dust: 0.12, dustMotion: 0.1 },
  closing: { skyTop: "#6c7190", skyBottom: "#b7a6b3", haze: 0.5, rays: 0.35, dust: 0.45, dustMotion: 0.4 },
};

const ids = Object.keys(MOODS) as SceneId[];

type RGB = [number, number, number];
const hexToRgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const cache = Object.fromEntries(
  ids.map((id) => [id, { top: hexToRgb(MOODS[id].skyTop), bottom: hexToRgb(MOODS[id].skyBottom) }]),
) as Record<SceneId, { top: RGB; bottom: RGB }>;

export type MoodBlend = { top: RGB; bottom: RGB; haze: number; rays: number; dust: number; dustMotion: number };
export const createMoodBlend = (): MoodBlend => ({ top: [0, 0, 0], bottom: [0, 0, 0], haze: 0, rays: 0, dust: 0, dustMotion: 0 });
export const rgbToCss = ([r, g, b]: RGB) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/**
 * Writes the presence-weighted blend of all moods into `out` (allocation-free).
 * Deliberately three.js-free: the DOM sky imports this and must stay in the main bundle.
 */
export function blendMood(out: MoodBlend) {
  let w = 0;
  out.top.fill(0);
  out.bottom.fill(0);
  out.haze = out.rays = out.dust = out.dustMotion = 0;
  for (const id of ids) {
    const k = sceneFrames[id].presence;
    if (k <= 0) continue;
    const m = MOODS[id];
    const c = cache[id];
    for (let i = 0; i < 3; i++) {
      out.top[i] += c.top[i] * k;
      out.bottom[i] += c.bottom[i] * k;
    }
    out.haze += m.haze * k;
    out.rays += m.rays * k;
    out.dust += m.dust * k;
    out.dustMotion += m.dustMotion * k;
    w += k;
  }
  if (w === 0) {
    const m = MOODS.invitation;
    out.top.splice(0, 3, ...cache.invitation.top);
    out.bottom.splice(0, 3, ...cache.invitation.bottom);
    Object.assign(out, { haze: m.haze, rays: m.rays, dust: m.dust, dustMotion: m.dustMotion });
    return;
  }
  for (let i = 0; i < 3; i++) {
    out.top[i] /= w;
    out.bottom[i] /= w;
  }
  out.haze /= w;
  out.rays /= w;
  out.dust /= w;
  out.dustMotion /= w;
}
