uniform vec2 uResolution;

#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
}

float scene(vec3 p) {
  float distance = sdSphere(p, 1.0);
  return distance;
}

float raymarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  vec3 color = vec3(0.0);

  for(int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;

    float dS = scene(p);
    dO += dS;

    if(dO > MAX_DIST || dS < SURF_DIST)
      break;
  }

  return dO;
}

void main() {

  // 将uv中心变为(0,0)，y轴范围为[-1,1]，x轴范围为[-aspect, aspect]
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  // Ray Origin - camera
  vec3 ro = vec3(0.0, 0.0, 5.0);
  // Ray Direction
  vec3 rd = normalize(vec3(uv, -1.0));
  // Raymarching
  float d = raymarch(ro, rd);
  vec3 p = ro + rd * d;

  vec3 color = vec3(0.0);
  if(d < MAX_DIST) {
    color = vec3(1.0);
  }

  gl_FragColor = vec4(color, 1.0);
}