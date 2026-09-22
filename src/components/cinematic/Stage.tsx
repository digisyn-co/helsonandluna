"use client";

import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { gsap } from "@/lib/gsap";
import { PerformanceMonitor } from "@react-three/drei";
import { visibleScenes } from "@/animation/sceneManager";
import { fallbackTier, stepTier, tierStore, useTier, webglOk } from "@/lib/device";
import { loadState } from "@/lib/loading";
import { Atmosphere } from "./Atmosphere";

// Per-scene 3D is code-split and mounted only while its chapter is near the viewport.
const PromiseRings = lazy(() => import("@/scenes/04-promise/Rings"));


/** A single scene failing must never break the page: drop to the static fallback. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    webglOk.set(false);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Lite tier: the canvas is drawn only while the page is moving or settling (a scene step),
 * never at rest — so a still chapter costs the GPU nothing and the compositor can idle.
 */
function DrawWhileMoving() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const root = document.documentElement;
    const tick = () => {
      if (root.dataset.step !== "idle") invalidate();
    };
    gsap.ticker.add(tick);
    invalidate();
    return () => gsap.ticker.remove(tick);
  }, [invalidate]);
  return null;
}

function SceneMounts() {
  const visible = visibleScenes.use();
  return <Suspense fallback={null}>{visible.has("promise") && <PromiseRings />}</Suspense>;
}

export default function Stage() {
  const { dpr, tier } = useTier();
  const lite = tier === "low";
  const ok = webglOk.use();
  if (!ok) return null;

  return (
    <div className="stage" aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          dpr={dpr}
          frameloop={lite ? "demand" : "always"}
          gl={{ antialias: tierStore.get() !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
          camera={{ fov: 35, near: 0.1, far: 50, position: [0, 0, 6] }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              webglOk.set(false);
            });
            requestAnimationFrame(() => loadState.set({ ...loadState.get(), stage: true }));
          }}
        >
          {lite && <DrawWhileMoving />}
          {/* Adapts the tier to real frame rates (mid-range Android stays lite; see device.ts). */}
          <PerformanceMonitor bounds={() => [45, 58]} flipflops={3} onDecline={() => stepTier(-1)} onIncline={() => stepTier(1)} onFallback={fallbackTier} />
          <Atmosphere />
          <SceneMounts />
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
