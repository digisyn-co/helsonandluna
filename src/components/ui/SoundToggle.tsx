"use client";

import { useEffect } from "react";
import { soundState, toggle, watchFirstGesture, watchVisibility } from "@/audio/ethereal";

/**
 * The guest's control over sound: a small speaker in the corner of the frame. The song starts
 * at their first gesture anywhere on the page — the earliest a browser allows — and this turns
 * it off, or back on, at any time. The choice is remembered on their device.
 */
export function SoundToggle() {
  const { on } = soundState.use();
  useEffect(() => watchVisibility(), []);
  useEffect(() => watchFirstGesture(), []);

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn the music off" : "Turn the music on"}
      title={on ? "Music on" : "Music off"}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" />
        {on ? (
          <>
            <path d="M15.4 9.3a3.8 3.8 0 0 1 0 5.4" />
            <path d="M17.9 6.8a7.3 7.3 0 0 1 0 10.4" />
          </>
        ) : (
          <path d="M16 9.6l4.4 4.8M20.4 9.6L16 14.4" />
        )}
      </svg>
    </button>
  );
}
