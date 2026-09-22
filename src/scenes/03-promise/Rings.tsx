"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { AdditiveBlending, CanvasTexture, Group, MathUtils, SpotLight, Sprite, SRGBColorSpace } from "three";
import { sceneFrames } from "@/animation/sceneManager";
import { pinProgress, segment } from "@/animation/pin";
import { sceneLength } from "@/content/scenes";
import { env, useTier } from "@/lib/device";

const RING_R = 1;
const LENGTH = sceneLength("promise");

/** Soft four-point star used for the reflection, glints and glow (drawn once, no asset). */
function useStarTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const glow = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(255,248,232,1)");
    glow.addColorStop(0.18, "rgba(255,236,200,0.55)");
    glow.addColorStop(1, "rgba(255,236,200,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, 128, 128);
    g.globalCompositeOperation = "lighter";
    for (const [w, h] of [[128, 3], [3, 128]]) {
      const ray = g.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2);
      ray.addColorStop(0, "rgba(255,248,232,0)");
      ray.addColorStop(0.5, "rgba(255,248,232,0.9)");
      ray.addColorStop(1, "rgba(255,248,232,0)");
      g.fillStyle = ray;
      g.fillRect(64 - w / 2, 64 - h / 2, w, h);
    }
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
}

/**
 * 03 — The Promise. A luxury product reveal driven by scroll:
 * darkness → a tiny reflection → the rings emerge as the key light rises → slow orbit
 * and push-in → a champagne highlight travels across the metal → crystal glint.
 * (Type and the exit flare are DOM, in Promise.tsx.)
 */
export default function Rings() {
  const { ringSegments } = useTier();
  const get = useThree((s) => s.get);
  const group = useRef<Group>(null);
  const key = useRef<SpotLight>(null);
  const sweep = useRef<SpotLight>(null);
  const reflection = useRef<Sprite>(null);
  const glint = useRef<Sprite>(null);
  const star = useStarTexture();
  const smoothed = useRef(0);

  // Leave the shared camera exactly as we found it.
  useEffect(() => {
    const start = get().camera.position.clone();
    return () => {
      const { camera, scene } = get();
      camera.position.copy(start);
      camera.lookAt(0, 0, 0);
      scene.environmentIntensity = 1;
    };
  }, [get]);

  const gold = {
    color: "#e6c790",
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.25,
  } as const;

  useFrame((state, dt) => {
    const { camera, scene } = state;
    const delta = Math.min(dt, 1 / 30);
    const target = pinProgress(sceneFrames.promise.progress, LENGTH);
    smoothed.current = MathUtils.damp(smoothed.current, target, 4, delta);
    const t = smoothed.current;

    const emerge = segment(t, 0.16, 0.42);
    const orbit = segment(t, 0.2, 0.95);
    const light = segment(t, 0.42, 0.72);
    const crystal = segment(t, 0.6, 0.72);
    const handoff = segment(t, 0.82, 0.96); // the DOM flare takes over

    // Portrait phones: keep the pair inside the frame and above the copy.
    const aspect = state.size.width / state.size.height;
    const landscape = aspect >= 1;
    // Portrait: fit the width. Landscape: smaller and higher, clear of the headline.
    const fit = landscape ? 0.74 : Math.min(1, aspect / 0.8);
    const g = group.current;
    // Only exist inside this chapter's window — never as silhouettes over neighbours.
    const inWindow = target > 0.01 && target < 0.985;
    if (g) g.visible = inWindow;
    if (g) {
      g.scale.setScalar((0.82 + emerge * 0.18) * fit);
      g.position.y = landscape ? 0.62 : 0.55;
      g.rotation.y = MathUtils.lerp(-0.9, 1.15, orbit) + (env.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.3) * 0.02);
      g.rotation.x = MathUtils.lerp(0.5, 0.18, orbit);
    }

    // Slow push-in on the lens axis.
    camera.position.set(0, 0.15, MathUtils.lerp(7.2, 5.1, orbit));
    camera.lookAt(0, landscape ? 0.25 : 0.45, 0);

    // The rings are revealed by light, not by fading: key + environment rise together.
    if (key.current) key.current.intensity = 60 * emerge * (1 - handoff);
    scene.environmentIntensity = (0.05 + emerge * 0.95) * (1 - handoff * 0.9);
    if (sweep.current) {
      sweep.current.position.x = MathUtils.lerp(-4, 4, light);
      sweep.current.intensity = 90 * Math.sin(Math.PI * light);
    }

    // First, a tiny reflection in the dark; it grows into the first highlight.
    if (reflection.current) {
      const r = segment(t, 0.06, 0.2) * (1 - segment(t, 0.28, 0.4));
      reflection.current.material.opacity = r;
      reflection.current.scale.setScalar(0.15 + r * 0.35);
    }
    if (glint.current) {
      const flare = Math.sin(Math.PI * crystal);
      glint.current.material.opacity = flare;
      glint.current.scale.setScalar(0.1 + flare * 0.55);
      glint.current.material.rotation = crystal * 0.8;
    }
  });

  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff1d8" position={[3, 2, 3]} scale={[3, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#a9b4d8" position={[-4, 1, -2]} scale={[2, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={0.8} color="#efdcb7" position={[0, 4, 1]} scale={3} target={[0, 0, 0]} />
      </Environment>
      <ambientLight intensity={0.02} />
      <spotLight ref={key} position={[3, 4, 5]} angle={0.5} penumbra={1} decay={2} color="#ffe6c2" intensity={0} />
      <spotLight ref={sweep} position={[-4, 1.5, 3]} angle={0.35} penumbra={1} decay={2} color="#fff4e0" intensity={0} />

      <group ref={group}>
        {/* Interlocked bands: slightly flattened tori read as wedding bands, not donuts. */}
        <mesh rotation={[0, 0, 0]} position={[-0.38, 0, 0]} scale={[1, 1, 1.9]}>
          <torusGeometry args={[RING_R, 0.075, 48, ringSegments]} />
          <meshPhysicalMaterial {...gold} />
        </mesh>
        <mesh rotation={[Math.PI / 2.3, 0.35, 0]} position={[0.38, 0.05, 0]} scale={[0.92, 0.92, 1.7]}>
          <torusGeometry args={[RING_R, 0.07, 48, ringSegments]} />
          <meshPhysicalMaterial {...gold} color="#efd6a6" roughness={0.18} />
        </mesh>
        {/* A single stone on the first band catches the crystal glint. */}
        <mesh position={[-0.38, RING_R + 0.09, 0]}>
          <octahedronGeometry args={[0.065, 0]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0} ior={2.4} envMapIntensity={4} clearcoat={1} />
        </mesh>
        <sprite ref={glint} position={[-0.38, RING_R + 0.1, 0.12]}>
          <spriteMaterial map={star} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
        </sprite>
      </group>

      <sprite ref={reflection} position={[0.35, 0.75, 0.6]}>
        <spriteMaterial map={star} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
    </>
  );
}
