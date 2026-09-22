/**
 * Chapter order and labels. Progress UI renders `03 / 09 · THE PROMISE`.
 * `length` is the chapter height in screens (svh). Chapters longer than 1 pin their
 * content while scroll drives the camera through them.
 * `flow` chapters (long reading content: names, details, RSVP) scroll normally instead of
 * dissolving; their neighbours fade within the third of a screen nearest them so text never
 * sits on top of imagery.
 * `rest` is where a pinned chapter settles between scrolls (pinned progress 0..1): its
 * composed frame, after its intro and before its exit. One scroll glides rest → next rest,
 * so every transition in between plays in full (see animation/sceneStepper.ts).
 */
export const SCENES = [
  { id: "invitation", title: "The Invitation", length: 1, rest: 0 },
  { id: "beginning", title: "The Beginning", length: 2, rest: 1 },
  { id: "two-of-us", title: "The Two of Us", length: 2, rest: 1 },
  { id: "family", title: "Family", length: 2.4, rest: 1 },
  { id: "promise", title: "The Promise", length: 2.4, rest: 0.75 },
  { id: "entourage", title: "The Entourage", length: 1, rest: 0, flow: true },
  { id: "ceremony", title: "The Ceremony", length: 1.8, rest: 0.8 },
  { id: "celebration", title: "The Celebration", length: 1.8, rest: 0.65 },
  { id: "details", title: "The Details", length: 1, rest: 0, flow: true },
  { id: "closing", title: "The Closing", length: 1.6, rest: 1 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const sceneIndex = (id: SceneId) => SCENES.findIndex((s) => s.id === id);

export const sceneLength = (id: SceneId) => SCENES.find((s) => s.id === id)?.length ?? 1;

export const isFlow = (i: number) => Boolean((SCENES[i] as { flow?: boolean } | undefined)?.flow);
/** Screens over which a pinned chapter fades in / out (shorter next to reading chapters). */
export function fadeScreens(id: SceneId) {
  const i = sceneIndex(id);
  return { in: isFlow(i - 1) ? 0.35 : 1, out: isFlow(i + 1) ? 0.35 : 1 };
}
