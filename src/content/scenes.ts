/**
 * Chapter order and labels. Progress UI renders `03 / 09 · THE PROMISE`.
 * `length` is the chapter height in screens (svh). Chapters longer than 1 pin their
 * content while scroll drives the camera through them.
 */
export const SCENES = [
  { id: "invitation", title: "The Invitation", length: 1 },
  { id: "beginning", title: "The Beginning", length: 2 },
  { id: "two-of-us", title: "The Two of Us", length: 2 },
  { id: "promise", title: "The Promise", length: 2.4 },
  { id: "family", title: "Family", length: 2.4 },
  { id: "ceremony", title: "The Ceremony", length: 1.8 },
  { id: "celebration", title: "The Celebration", length: 1.8 },
  { id: "details", title: "The Details", length: 1 },
  { id: "closing", title: "The Closing", length: 1.6 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const sceneIndex = (id: SceneId) => SCENES.findIndex((s) => s.id === id);

export const sceneLength = (id: SceneId) => SCENES.find((s) => s.id === id)?.length ?? 1;
