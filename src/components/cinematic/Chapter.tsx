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
 * while the extra height becomes scroll distance for the camera.
 * Reading chapters (`pinned={false}`) are exactly one screen with their own scroller, so
 * one page step reaches them and every name / RSVP field is still reachable inside.
 */
export const Chapter = forwardRef<HTMLElement, Props>(function Chapter({ id, label, className, pinClassName, pinned = true, children }, ref) {
  const length = sceneLength(id);
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      tabIndex={-1}
      className={["chapter", className].filter(Boolean).join(" ")}
      style={{ minHeight: `calc(var(--scene-h) * ${length})` }}
    >
      {pinned ? (
        <div className={["chapter__pin", pinClassName].filter(Boolean).join(" ")}>{children}</div>
      ) : (
        <div className="chapter__scroll">
          <div className={["chapter__flow", pinClassName].filter(Boolean).join(" ")}>{children}</div>
        </div>
      )}
    </section>
  );
});
