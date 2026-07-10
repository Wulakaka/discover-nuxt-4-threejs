uniform float uTime;
uniform vec3 uColor;
uniform float uFresnelPower;
uniform float uFresnelStrength;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjPos;

const float SQRT3 = 1.7320508;

// 计算以原点为中心的单位正六边形的有符号距离。
// 先利用对称性把点折叠到第一象限，再比较斜边和平边约束，
// 得到当前点到六边形边界的距离。
float hexSdf(vec2 point) {
  point = abs(point);
  return max(dot(point, normalize(vec2(1.0, SQRT3))), point.x) - 0.58;
}

// 基于六边形距离场生成重复的蜂窝图案。
// 通过两个错位单元中选最近的一个，让每个 UV 都落到最近的六边形中心，
// 再用 smoothstep 把边界距离压成一圈细描边。
float hexPattern(vec2 uv) {
  float scale = 3.0;
  float thickness = 0.08;

  uv *= scale;

  // 六边形在以 (1, sqrt(3)) 为基底的斜网格上平铺。
  vec2 cellSize = vec2(1.0, SQRT3);
  vec2 cellA = mod(uv, cellSize) - 0.5 * cellSize;
  vec2 cellB = mod(uv - vec2(0.5, 0.5 * SQRT3), cellSize) - 0.5 * cellSize;
  vec2 cell = dot(cellA, cellA) < dot(cellB, cellB) ? cellA : cellB;

  float edge = abs(hexSdf(cell));
  return 1.0 - smoothstep(thickness, thickness + 0.035, edge);
}

void main() {

  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);
  float fresnel = pow(1.0 + dot(normal, viewDir), uFresnelPower) * uFresnelStrength;

  // 按当前位置主轴选择一个投影平面，使用单平面六边形图案。
  vec2 faceUV;
  vec3 absN = abs(normalize(vObjPos));

  if(absN.x >= absN.y && absN.x >= absN.z)
    faceUV = vObjPos.yz;
  else if(absN.y >= absN.z)
    faceUV = vObjPos.xz;
  else
    faceUV = vObjPos.xy;

  float hexFade = fresnel;
  float hex = hexPattern(faceUV) * hexFade;

  float alpha = clamp(fresnel * 0.8 + hex, 0.0, 1.0);

  // float pulse = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * 1.6 - length(vObjPos.xy) * 14.0 + vObjPos.z * 7.0), 2.0);

  // float shell = fresnel * 0.28;
  // float grid = fresnel * hex * pulse;
  // vec3 color = uColor * hex * 10.0;

  // float alpha = clamp(shell * 0.8 + grid, 0.0, 1.0);

  gl_FragColor = vec4(uColor, alpha);
}