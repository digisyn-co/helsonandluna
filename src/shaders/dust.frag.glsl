uniform vec3 uColor;
uniform float uOpacity;

varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, core * core * vTwinkle * uOpacity);
  #include <colorspace_fragment>
}
