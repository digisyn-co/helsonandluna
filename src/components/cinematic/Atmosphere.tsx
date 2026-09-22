"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, ShaderMaterial, Vector2 } from "three";
import { blendMood, createMoodBlend } from "@/animation/moods";
import { env, useTier } from "@/lib/device";
import { createRandom } from "@/lib/random";
import hazeFrag from "@/shaders/haze.frag.glsl";
import dustVert from "@/shaders/dust.vert.glsl";
import dustFrag from "@/shaders/dust.frag.glsl";

const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/** Haze + light rays (full-screen) and champagne motes, driven by the chapter mood blend. */
export function Atmosphere() {
  const { particles, tier } = useTier();
  const lite = tier === "low";
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const haze = useRef<ShaderMaterial>(null);
  const dust = useRef<ShaderMaterial>(null);
  const mood = useMemo(() => createMoodBlend(), []);

  const hazeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHaze: { value: 0.5 },
      uRays: { value: 0 },
      uTint: { value: new Color("#a9b4d8") },
      uResolution: { value: new Vector2(1, 1) },
    }),
    [],
  );

  const dustUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: 1 },
      uMotion: { value: 0 },
      uColor: { value: new Color("#efdcb7") },
      uOpacity: { value: 0 },
    }),
    [],
  );

  const { positions, scales, phases } = useMemo(() => {
    const rnd = createRandom(17);
    const positions = new Float32Array(particles * 3);
    const scales = new Float32Array(particles);
    const phases = new Float32Array(particles);
    for (let i = 0; i < particles; i++) {
      positions.set([(rnd() - 0.5) * 9, (rnd() - 0.5) * 10, -rnd() * 6 - 0.5], i * 3);
      scales[i] = 0.25 + rnd() ** 4 * 1.6; // mostly specks, a few soft motes
      phases[i] = rnd();
    }
    return { positions, scales, phases };
  }, [particles]);

  useFrame((_, dt) => {
    const delta = Math.min(dt, 1 / 30);
    blendMood(mood);
    const motion = env.reducedMotion ? 0 : 1;
    if (haze.current) {
      const u = haze.current.uniforms;
      u.uTime.value += delta * motion;
      u.uHaze.value = mood.haze;
      u.uRays.value = env.reducedMotion ? mood.rays * 0.5 : mood.rays;
      u.uResolution.value.set(size.width, size.height);
    }
    if (dust.current) {
      const u = dust.current.uniforms;
      u.uTime.value += delta * motion;
      u.uMotion.value = mood.dustMotion * motion;
      u.uOpacity.value = env.reducedMotion ? mood.dust * 0.4 : mood.dust;
      u.uPixelRatio.value = dpr;
    }
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          key={lite ? "lite" : "full"}
          ref={haze}
          defines={lite ? { LITE: "" } : {}}
          vertexShader={FULLSCREEN_VERT}
          fragmentShader={hazeFrag}
          uniforms={hazeUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <points frustumCulled={false}>
        <bufferGeometry key={particles}>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
          <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={dust}
          vertexShader={dustVert}
          fragmentShader={dustFrag}
          uniforms={dustUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </>
  );
}
