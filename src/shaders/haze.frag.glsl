// Full-screen atmospheric haze + light rays, alpha-blended over the CSS sky gradient.
precision highp float;

uniform float uTime;
uniform float uHaze;      // 0..1 overall haze amount
uniform float uRays;      // 0..1 light-ray strength from the top
uniform vec3 uTint;       // haze colour
uniform vec2 uResolution;

varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Slow, layered haze drifting sideways — air, not smoke.
  float h = fbm(p * 1.6 + vec2(uTime * 0.012, uTime * 0.004));
  h = smoothstep(0.35, 0.95, h) * (0.35 + 0.65 * (1.0 - uv.y));

  // Soft god-rays from above the frame, very low frequency.
  vec2 src = vec2(0.5 * aspect, 1.25);
  vec2 d = p - src;
  float ang = atan(d.x, -d.y);
  float rays = pow(max(0.0, sin(ang * 9.0 + 1.3) * 0.5 + 0.5), 6.0) * smoothstep(1.6, 0.2, length(d));
  rays *= 0.6 + 0.4 * noise(vec2(ang * 3.0, uTime * 0.05));

  float a = h * uHaze * 0.22 + rays * uRays * 0.16;
  gl_FragColor = vec4(uTint, a);
}
