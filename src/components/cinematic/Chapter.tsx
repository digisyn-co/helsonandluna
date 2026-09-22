import { forwardRef, type ReactNode } from "react";
import { sceneLength, type SceneId } from "@/content/scenes";

type Props = {
  id: SceneId;
  label: string;
  className?: string;
  pinClassName?: string;
  /** false = normal flow (content taller than a screen, e.g. Details/RSVP). */
  pinned?: boolean;
  children: ReactNode;
};

/**
 * A full-screen chapter. Chapters longer than one screen keep their content pinned
 * (sticky) while the extra height becomes scroll distance for the camera.
 */
export const Chapter = forwardRef<HTMLElement, Props>(function Chapter({ id, label, className, pinClassName, pinned = true, children }, ref) {
  const length = sceneLength(id);
  return (
    <section
      ref={ref}
      id={id}
      data-snap
      aria-label={label}
      tabIndex={-1}
      className={["chapter", className].filter(Boolean).join(" ")}
      style={{ minHeight: `calc(var(--scene-h) * ${length})` }}
    >
      <div className={[pinned ? "chapter__pin" : "chapter__flow", pinClassName].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
});
