<script setup lang="ts">
import {
  add,
  color,
  float,
  Fn,
  If,
  normalView,
  positionLocal,
  positionViewDirection,
  pow,
  uniform,
  vec2,
} from "three/tsl";
import * as THREE from "three/webgpu";
import {INSPECTOR_KEY} from "../INJECTION_KEYS";

const inspector = inject(INSPECTOR_KEY);

const gui = inspector?.createParameters("Params");

const uColor = uniform(new THREE.Color("#00ff00"));

const uFresnelPower = uniform(1.8);

const uFresnelStrength = uniform(float(1.0));

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

gui?.addColor(uColor, "value").name("Sphere Color");
gui?.add(uFresnelPower, "value", 0.5, 5, 0.1).name("Fresnel Power");
gui?.add(uHexScale, "value", 1, 20, 0.5).name("Hex Scale");
gui?.add(uEdgeWidth, "value", 0.01, 0.2, 0.005).name("Edge Width");
gui?.add(uFlashSpeed, "value", 0.5, 8, 0.1).name("Flash Speed");
gui?.add(uFlashIntensity, "value", 0, 1, 0.1).name("Flash Intensity");

const outColor = color(uColor).toVar();

// —— Fresnel ————————————————————————————————
const fresnel = pow(
  normalView.dot(positionViewDirection).oneMinus(),
  uFresnelPower,
).mul(uFresnelStrength);

// —— 六边形 ————————————————————————————————
// 找到需要显示的面
const absN = positionLocal.normalize().abs();

// 接缝处
// 颜色是从根号2/2处开始显示的，也就是接缝处大约在0.71的位置
const dominance = absN.x.max(absN.y).max(absN.z);
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
const flash = cellFlash(cId);

const intensity = add(
  hex.mul(float(0.3).add(fresnel.mul(0.7))), // 让边缘的六边形更亮
  fresnel.mul(0.4), // 再加入 fresnel 辉光
  flash,
);

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: outColor,
  opacityNode: intensity,
  transparent: true,
});
</script>

<template>
  <TresMesh :material="material" :position-y="1.8">
    <TresSphereGeometry :args="[1.8, 64, 64]" />
  </TresMesh>
</template>

<style scoped></style>
