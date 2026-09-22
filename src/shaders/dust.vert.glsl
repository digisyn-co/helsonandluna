uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMotion;   // 0 = still (reduced motion / quiet scenes), 1 = gentle drift

attribute float aScale;
attribute float aPhase;

varying float vTwinkle;

void main() {
  vec3 p = position;
  float t = uTime * uMotion;
  // Champagne motes barely drift: slow rise with a tiny lateral sway.
  p.y += mod(t * 0.03 * (0.5 + aScale) + aPhase * 10.0, 10.0) - 5.0;
  p.x += sin(t * 0.2 + aPhase * 6.28) * 0.05;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;
  vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase) + aPhase * 12.0);
}
