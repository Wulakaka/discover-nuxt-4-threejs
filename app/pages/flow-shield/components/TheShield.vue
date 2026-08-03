<script setup lang="ts">
import {
  abs,
  acos,
  add,
  clamp,
  dot,
  float,
  Fn,
  If,
  Loop,
  max,
  min,
  mix,
  mul,
  mx_noise_float,
  normalView,
  positionLocal,
  positionViewDirection,
  pow,
  smoothstep,
  time,
  uniform,
  uniformArray,
  vec2,
  vec3,
} from "three/tsl";
import * as THREE from "three/webgpu";
import type {PointerEvent} from "@pmndrs/pointer-events";

import {MAX_HITS} from "../const";
import {INSPECTOR_KEY} from "../INJECTION_KEYS";

// -- Component state ----------------------------------------------------------
const inspector = inject(INSPECTOR_KEY);

const gui = inspector?.createParameters("Force Shield");

const manualReveal = ref(false);

const revealProgress = ref(1);

const revealSpeed = ref(3.5);

// -- Shader uniforms ----------------------------------------------------------
const uTime = uniform(performance.now() / 1000);

const uLife = uniform(1);

const uColor = uniform(new THREE.Color("#26aeff"));

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

const uShowHex = uniform(true);

const uReveal = uniform(1);
const uFlowSpeed = uniform(1.13);
const uFlowScale = uniform(2.4);
const uFlowIntensity = uniform(4.0);
const uNoiseScale = uniform(1.3);
const uNoiseEdgeColor = uniform(new THREE.Color("#26aeff"));
const uNoiseEdgeWidth = uniform(0.02);
const uNoiseEdgeIntensity = uniform(10);
const uNoiseEdgeSmoothness = uniform(0.5);

const uOpacity = uniform(0.75);
const uFadeStart = uniform(0);

// CPU-side ring buffer mirrored by the uniform arrays.
const hitPositions = Array.from({length: MAX_HITS}, () => new THREE.Vector3());
const hitTimes = Array.from({length: MAX_HITS}, () => -1);

const uHitPositions = uniformArray(hitPositions, "vec3");
const uHitTimes = uniformArray(hitTimes, "float");

// 此处为单位为 弧度/秒，不是 米/秒
const uHitRingSpeed = uniform(1.75);
const uHitRingWidth = uniform(0.12);
const uHitMaxRadius = uniform(0.85);
const uHitDuration = uniform(1.8);
const uHitIntensity = uniform(4.1);
const uHitImpactRadius = uniform(0.3);
const hitDamage = ref(5);

// -- Debug controls -----------------------------------------------------------
gui?.add(manualReveal, "value").name("Manual Reveal");
gui?.add(revealProgress, "value", 0, 1, 0.01).name("↳ Reveal Progress");
gui?.addColor(uColor, "value").name("Sphere Color");
gui?.add(uFresnelPower, "value", 0.5, 5, 0.1).name("Fresnel Power");
gui?.add(uFresnelStrength, "value", 0, 3, 0.05).name("Fresnel Strength");
gui?.add(uOpacity, "value", 0, 1, 0.01).name("Opacity");
gui?.add(uFadeStart, "value", -1, 1, 0.01).name("Fade Start");
gui?.add(revealSpeed, "value", 0.5, 5, 0.1).name("Reveal Speed");
gui?.add(uHexScale, "value", 1, 20, 0.5).name("Hex Scale");
gui?.add(uHexOpacity, "value", 0, 1, 0.01).name("Hex Opacity");
gui?.add(uShowHex, "value").name("Show Hex");
gui?.add(uEdgeWidth, "value", 0.01, 0.2, 0.005).name("Edge Width");
gui?.add(uFlashSpeed, "value", 0.5, 8, 0.1).name("Flash Speed");
gui?.add(uFlashIntensity, "value", 0, 1, 0.1).name("Flash Intensity");
gui?.add(uFlowSpeed, "value", 0, 2, 0.01).name("Flow Speed");
gui?.add(uFlowScale, "value", 0.1, 8, 0.01).name("Flow Scale");
gui?.add(uFlowIntensity, "value", 0, 4, 0.01).name("Flow Intensity");
gui?.add(uNoiseScale, "value", 0.5, 10, 0.1).name("Noise Scale");
gui?.addColor(uNoiseEdgeColor, "value").name("Noise Edge Color");
gui?.add(uNoiseEdgeWidth, "value", 0.01, 0.5, 0.01).name("Noise Edge Width");
gui?.add(uNoiseEdgeIntensity, "value", 0, 10, 0.1).name("Noise Edge Intensity");
gui
  ?.add(uNoiseEdgeSmoothness, "value", 0, 1, 0.01)
  .name("Noise Edge Smoothness");

const hitGUI = gui?.addFolder("Hit Effect");
hitGUI?.add(uHitRingSpeed, "value", 0.1, 6, 0.01).name("Ring Speed");
hitGUI?.add(uHitRingWidth, "value", 0.01, 0.5, 0.01).name("Ring Width");
hitGUI?.add(uHitMaxRadius, "value", 0.12, 3.14, 0.05).name("Ring Radius");
hitGUI?.add(uHitDuration, "value", 0.5, 6, 0.1).name("Duration");
hitGUI?.add(uHitIntensity, "value", 0, 8, 0.1).name("Intensity");
hitGUI?.add(uHitImpactRadius, "value", 0.1, 1.5, 0.05).name("Impact Radius");
hitGUI?.add(hitDamage, "value", 1, 100, 1).name("Damage %");
hitGUI
  ?.add(
    {
      resetLife,
    },
    "resetLife",
  )
  .name("Reset Life");

// -- Shader helpers -----------------------------------------------------------
const getLifeColor = Fn(([life]: [life: ReturnType<typeof float>]) =>
  mix(vec3(1.0, 0.08, 0.04), uColor, life),
);

function resetLife() {
  uLife.value = 1;
}

// -- Shader graph: reveal/dissolve --------------------------------------------
const noise = mx_noise_float(positionLocal.mul(uNoiseScale), 0.5, 0.5);
const revealMask = smoothstep(uReveal.sub(uNoiseEdgeWidth), uReveal, noise);

const innerFade = mix(0.98, 0.15, uNoiseEdgeSmoothness);
const edgeLow = smoothstep(
  uReveal.sub(uNoiseEdgeWidth),
  uReveal.sub(uNoiseEdgeWidth.mul(innerFade)),
  noise,
);
const edgeHigh = smoothstep(
  uReveal.sub(uNoiseEdgeWidth.mul(0.15)),
  uReveal,
  noise,
);

// __/-- edgeLow
// ---\_ edgeHigh.oneMinus()
// 相乘形成一个山峰形状
const revealEdge = edgeLow.mul(edgeHigh.oneMinus());

// -- Fresnel ------------------------------------------------------------------
const fresnel = pow(
  normalView.dot(positionViewDirection).oneMinus(),
  uFresnelPower,
).mul(uFresnelStrength);

// -- Flow noise ---------------------------------------------------------------
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

// -- Hex pattern --------------------------------------------------------------
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

// -- Hit effects --------------------------------------------------------------
// 每个插槽：噪声化的圆环 + 初始六边形高亮区域

const hitEffects = Fn(() => {
  const normPos = positionLocal.normalize();
  // 圆环贡献值
  const ringContrib = float(0.0).toVar();
  // 六边形增强值
  const hexHitBoost = float(0.0).toVar();

  Loop(MAX_HITS, ({i}) => {
    const ht = uHitTimes.element(i);
    const hp = uHitPositions.element(i);
    const elapsed = uTime.sub(ht);

    // 表示是否处于动画状态
    const isActive = mul(
      ht.step(0),
      elapsed.step(0),
      uHitDuration.step(elapsed),
    );

    // 沿球面计算的最短距离（弧度）
    const dist = acos(clamp(dot(normPos, hp.normalize()), -1, 1));

    // 扩展圆环 - 在 uHitMaxRadius 地方截断，在到达时渐隐
    // 环半径，随时间扩大，不超过 uHitMaxRadius
    const ringRadius = min(elapsed.mul(uHitRingSpeed), uHitMaxRadius);
    const distanceNoise = mx_noise_float(
      normPos.mul(5).add(vec3(elapsed.mul(2))),
    ).mul(0.05);
    // 在圆环上时，ring 为 1
    const ring = abs(dist.add(distanceNoise).sub(ringRadius))
      .smoothstep(0, uHitRingWidth)
      .oneMinus();
    // 持续时间超过一半时开始隐藏
    const fade = elapsed
      .smoothstep(uHitDuration.mul(0.5), uHitDuration)
      .oneMinus();
    // 弧度超过 75% 时开始隐藏
    const radialFade = ringRadius
      .smoothstep(uHitMaxRadius.mul(0.75), uHitMaxRadius)
      .oneMinus();
    ringContrib.addAssign(mul(ring, fade, radialFade, isActive));

    // 高亮六边形：在受击区域内的六边形高亮
    // 在受击区域内是 1-0
    const zone = dist.smoothstep(0, uHitImpactRadius).oneMinus();
    // 在持续时间的35%内是 1-0
    const zoneFade = elapsed.smoothstep(0, uHitDuration.mul(0.35)).oneMinus();
    hexHitBoost.addAssign(mul(zone, zoneFade, isActive));
  });

  ringContrib.minAssign(2.0);
  hexHitBoost.minAssign(1.0);

  return vec2(ringContrib, hexHitBoost);
})();

// -- Final composition --------------------------------------------------------

const lifeColor = getLifeColor(uLife);

const ringContrib = hitEffects.x;
const hexHitBoost = hitEffects.y;

// 生效的六边形透明度
const effectiveHexOpacity = mul(
  uHexOpacity.add(hexHitBoost.mul(uHitIntensity)),
  uShowHex,
);

const intensity = add(
  hex.mul(effectiveHexOpacity).mul(float(0.3).add(fresnel.mul(0.7))), // 让边缘的六边形更亮
  fresnel.mul(0.4), // 再加入 fresnel 辉光
  flash.mul(uShowHex),
);

const shieldColor = add(
  lifeColor.mul(intensity).mul(2),
  lifeColor.mul(uFlowIntensity).mul(flowNoise).mul(fresnel),
  lifeColor.mul(ringContrib).mul(uHitIntensity),
);

const edgeColor = mix(uNoiseEdgeColor, lifeColor, uLife.oneMinus());
const edgeGlow = mul(edgeColor, revealEdge, uNoiseEdgeIntensity);

const normY = positionLocal.y.div(1.8);

const alpha = add(
  mul(intensity, revealMask, uOpacity), // 溶解效果
  revealEdge.mul(uNoiseEdgeIntensity), // 溶解边缘
)
  .clamp()
  .mul(normY.smoothstep(-1, uFadeStart));

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: shieldColor.add(edgeGlow),
  opacityNode: alpha,
  transparent: true,
});

// -- Runtime updates and interaction -----------------------------------------
const {onRender} = useLoop();
onRender(({delta}) => {
  uTime.value = performance.now() / 1000;

  if (manualReveal.value) {
    uReveal.value = revealProgress.value;
  } else {
    const target = 0;
    uReveal.value = THREE.MathUtils.lerp(
      uReveal.value,
      target,
      1 - Math.exp(-revealSpeed.value * delta),
    );
    if (uReveal.value < 0.005) uReveal.value = 0;
    if (uReveal.value > 0.995) uReveal.value = 1;
  }
});

let hitIndex = 0;

function handleClick(e: PointerEvent<MouseEvent>) {
  const localPoint = e.object.worldToLocal(e.point.clone());

  const idx = hitIndex % MAX_HITS;
  hitIndex++;

  hitPositions[idx]!.copy(localPoint);
  hitTimes[idx] = performance.now() / 1000;

  uLife.value = Math.max(0, uLife.value - hitDamage.value / 100);
}
</script>

<template>
  <TresMesh :material="material" :position-y="1.8" @click="handleClick">
    <TresSphereGeometry :args="[1.8, 64, 64]" />
  </TresMesh>
</template>

<style scoped></style>
