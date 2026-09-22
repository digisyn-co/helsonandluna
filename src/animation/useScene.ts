"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { SceneId } from "@/content/scenes";
import { registerScene, type SceneHandlers } from "./sceneManager";

/**
 * Registers a chapter element with the scene manager. Handlers are read through a ref,
 * so passing a fresh object each render never re-registers.
 */
export function useScene(id: SceneId, ref: RefObject<HTMLElement | null>, handlers: SceneHandlers = {}) {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerScene(id, el, {
      enter: (d) => latest.current.enter?.(d),
      progress: (p, f) => latest.current.progress?.(p, f),
      exit: (d) => latest.current.exit?.(d),
    });
  }, [id, ref]);
}
