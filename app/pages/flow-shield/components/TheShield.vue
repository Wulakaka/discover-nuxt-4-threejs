<script setup lang="ts">
import {
  add,
  color,
  float,
  Fn,
  If,
  max,
  mx_noise_float,
  normalView,
  positionLocal,
  positionViewDirection,
  pow,
  time,
  uniform,
  vec2,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";
import {INSPECTOR_KEY} from "../INJECTION_KEYS";

const inspector = inject(INSPECTOR_KEY);

const gui = inspector?.createParameters("Params");

const uColor = uniform(new THREE.Color("#00ff00"));

const uFresnelPower = uniform(1.8);

const uHexOpacity = uniform(0.13);

const uFresnelStrength = uniform(float(1.75));

const {
  hexPattern,
  cellFlash,
  hexCellId,
  uniforms: {uHexScale, uEdgeWidth, uFlashSpeed, uFlashIntensity},
} = createHexCompute({
  hexScale: 3,
  edgeWidth: 0.06,
  flashSpeed: 0.6,
  flashIntensity: 0.11,
});

const uFlowSpeed = uniform(1.13);
const uFlowScale = uniform(2.4);
const uFlowIntensity = uniform(4.0);

gui?.addColor(uColor, "value").name("Sphere Color");
gui?.add(uFresnelPower, "value", 0.5, 5, 0.1).name("Fresnel Power");
gui?.add(uFresnelStrength, "value", 0, 3, 0.05).name("Fresnel Strength");
gui?.add(uHexScale, "value", 1, 20, 0.5).name("Hex Scale");
gui?.add(uHexOpacity, "value", 0, 1, 0.01).name("Hex Opacity");
gui?.add(uEdgeWidth, "value", 0.01, 0.2, 0.005).name("Edge Width");
gui?.add(uFlashSpeed, "value", 0.5, 8, 0.1).name("Flash Speed");
gui?.add(uFlashIntensity, "value", 0, 1, 0.1).name("Flash Intensity");
gui?.add(uFlowSpeed, "value", 0, 2, 0.01).name("Flow Speed");
gui?.add(uFlowScale, "value", 0.1, 8, 0.01).name("Flow Scale");
gui?.add(uFlowIntensity, "value", 0, 4, 0.01).name("Flow Intensity");

const lColor = color(uColor);

// —— Fresnel ————————————————————————————————
const fresnel = pow(
  normalView.dot(positionViewDirection).oneMinus(),
  uFresnelPower,
).mul(uFresnelStrength);

// —— Flow Noise ————————————————————————————————
const flowNoise = add(
  mx_noise_float(
    positionLocal.mul(uFlowScale).add(vec3(time, time.mul(0.6), time.mul(0.4))),
    0.3,
    0.3,
  ),
  mx_noise_float(
    positionLocal
      .mul(uFlowScale)
      .mul(2.1)
      .add(vec3(time.mul(-0.5), time.mul(0.9), time.mul(0.3))),
    0.2,
    0.2,
  ),
);

// —— 六边形 ————————————————————————————————
// 找到需要显示的面
const absN = positionLocal.normalize().abs();

// 接缝处
// 颜色是从根号2/2处开始显示的，也就是接缝处大约在0.71的位置
const dominance = max(absN.x, absN.y, absN.z);
const hexFade = dominance.smoothstep(0.65, 0.85);

const faceUV = Fn(() => {
  const faceUV = vec2().toVar();
  If(
    absN.x.greaterThanEqual(absN.y).and(absN.x.greaterThanEqual(absN.z)),
    () => {
      faceUV.assign(positionLocal.yz);
    },
  )
    .ElseIf(absN.y.greaterThanEqual(absN.z), () => {
      faceUV.assign(positionLocal.xz);
    })
    .Else(() => {
      faceUV.assign(positionLocal.xy);
    });

  return faceUV;
})();

const hex = hexPattern(faceUV).mul(hexFade);

const cId = hexCellId(faceUV);
// 乘以 hexFade 是为了让接缝隐藏
const flash = cellFlash(cId).mul(hexFade);

const intensity = add(
  hex.mul(uHexOpacity).mul(float(0.3).add(fresnel.mul(0.7))), // 让边缘的六边形更亮
  fresnel.mul(0.4), // 再加入 fresnel 辉光
  flash,
);

const shieldColor = add(
  lColor.mul(intensity).mul(2),
  lColor.mul(uFlowIntensity).mul(flowNoise).mul(fresnel),
);

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: shieldColor,
  opacityNode: intensity.clamp(),
  transparent: true,
});
</script>

<template>
  <TresMesh :material="material" :position-y="1.8">
    <TresSphereGeometry :args="[1.8, 64, 64]" />
  </TresMesh>
</template>

<style scoped></style>
