// Sun surface fragment shader
// Layered simplex noise for granulation, time-driven turbulence,
// deep orange core to yellow-white edge gradient, Fresnel rim glow.
// Outputs HDR values (> 1.0) for bloom post-processing pickup.

uniform float uTime;
uniform float uNoiseOctaves;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

/* ========================================= */
/* Simplex 3D noise — Ashima Arts            */
/* github.com/ashima/webgl-noise              */
/* ========================================= */

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron
  float n_ = 0.142857142857; // 1.0 / 7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix contributions from the four corners
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* ========================================= */
/* Layered noise (FBM — Fractional Brownian) */
/* ========================================= */

float fbm(vec3 p, float octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (float i = 0.0; i < 4.0; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

/* ========================================= */
/* Main                                       */
/* ========================================= */

void main() {
  // Slow turbulent animation driven by uTime
  float slowTime = uTime * 0.05;

  // Sample position on the sphere for noise — UV mapped to 3D
  vec3 noiseCoord = vec3(vUv * 4.0, slowTime);

  // Layered noise for solar granulation
  float noise = fbm(noiseCoord, uNoiseOctaves);

  // Secondary turbulence layer at different scale
  float turbulence = fbm(noiseCoord * 2.5 + vec3(slowTime * 0.3), max(uNoiseOctaves - 1.0, 1.0));

  // Combine noise layers
  float pattern = noise * 0.6 + turbulence * 0.4;
  pattern = pattern * 0.5 + 0.5; // Remap from [-1,1] to [0,1]

  // Color gradient: deep orange core → yellow-white at edges
  vec3 deepOrange = vec3(0.8, 0.267, 0.0);     // #CC4400
  vec3 brightYellow = vec3(1.0, 0.933, 0.533);  // #FFEE88
  vec3 hotWhite = vec3(1.2, 1.1, 0.9);          // HDR white-yellow

  // Mix based on noise pattern
  vec3 baseColor = mix(deepOrange, brightYellow, pattern);
  baseColor = mix(baseColor, hotWhite, pattern * pattern * 0.3);

  // Fresnel rim effect — bright edge atmosphere
  vec3 viewDir = normalize(-vPosition);
  float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
  fresnel = pow(fresnel, 2.0); // Sharpen the rim

  // Rim color: brighter, more orange-white
  vec3 rimColor = vec3(1.5, 0.9, 0.4); // HDR warm glow

  // Combine base with rim
  vec3 finalColor = baseColor + rimColor * fresnel * 1.5;

  // Add fine granulation detail
  float fineNoise = snoise(vec3(vUv * 12.0, slowTime * 0.8));
  finalColor += vec3(fineNoise * 0.08);

  // Boost overall intensity for bloom pickup (HDR values > 1.0)
  finalColor *= 1.8;

  gl_FragColor = vec4(finalColor, 1.0);
}
