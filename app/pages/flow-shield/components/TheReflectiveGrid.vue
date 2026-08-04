<script setup lang="ts">
import * as THREE from "three/webgpu";
import {
  abs,
  fwidth,
  mix,
  reflector,
  smoothstep,
  uniform,
  uv,
  vec2,
} from "three/tsl";

import {INSPECTOR_KEY} from "../INJECTION_KEYS";

interface Props {
  size?: number;
  cellCount?: number;
  reflectivity?: number;
  reflectionBlur?: number;
  resolutionScale?: number;
  gridColor?: THREE.ColorRepresentation;
  groundColor?: THREE.ColorRepresentation;
}

const props = withDefaults(defineProps<Props>(), {
  size: 12,
  cellCount: 48,
  reflectivity: 0.72,
  reflectionBlur: 0.25,
  resolutionScale: 0.75,
  gridColor: "#39c9ff",
  groundColor: "#02070d",
});

const reflection = reflector({
  resolutionScale: props.resolutionScale,
  generateMipmaps: true,
  bounces: false,
  samples: 4,
});

const inspector = inject(INSPECTOR_KEY);
const gui = inspector?.createParameters("Reflective Grid");

const uGridColor = uniform(new THREE.Color(props.gridColor));
const uGroundColor = uniform(new THREE.Color(props.groundColor));
const uReflectivity = uniform(props.reflectivity);
const uReflectionBlur = uniform(props.reflectionBlur);
const uCellCount = uniform(props.cellCount);
const uLineWidth = uniform(1.1);
const uGridIntensity = uniform(1.0);
const uFadeStart = uniform(0.72);
const uFadeEnd = uniform(1.0);

gui?.add(uReflectivity, "value", 0, 1, 0.01).name("Reflectivity");
gui?.add(uReflectionBlur, "value", 0, 1, 0.01).name("Reflection Blur");
gui
  ?.add(reflection.reflector, "resolutionScale", 0.25, 1, 0.05)
  .name("Resolution Scale");
gui?.add(uCellCount, "value", 4, 100, 1).name("Cell Count");
gui?.add(uLineWidth, "value", 0.1, 4, 0.05).name("Line Width");
gui?.add(uGridIntensity, "value", 0, 4, 0.05).name("Grid Intensity");
gui?.add(uFadeStart, "value", 0, 1.4, 0.01).name("Fade Start");
gui?.add(uFadeEnd, "value", 0.1, 1.5, 0.01).name("Fade End");
gui?.addColor(uGridColor, "value").name("Grid Color");
gui?.addColor(uGroundColor, "value").name("Ground Color");

const gridUv = uv().mul(uCellCount);
const distanceToLine = abs(gridUv.fract().sub(0.5));
const pixelDistance = distanceToLine.div(fwidth(gridUv));
const nearestLine = pixelDistance.x.min(pixelDistance.y);
const grid = smoothstep(
  uLineWidth.mul(0.5).sub(0.5),
  uLineWidth.mul(0.5).add(0.5),
  nearestLine,
).oneMinus();

// Keep the grid visually contained while leaving the mirror itself continuous.
const radialFade = smoothstep(
  uFadeStart,
  uFadeEnd,
  uv().sub(0.5).length().mul(2),
).oneMinus();
const gridColorNode = uGridColor.mul(grid).mul(radialFade).mul(uGridIntensity);
// Map the normalized GUI value to practical mip levels. Using maxMipLevel()
// here would require a native Texture, while reflection is a ReflectorNode.
reflection.biasNode = uReflectionBlur.mul(8);
const reflectedGround = mix(uGroundColor, reflection.rgb, uReflectivity);

const alpha = uv().distance(vec2(0.5)).smoothstep(0.48, 0.5).oneMinus();

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: reflectedGround.add(gridColorNode),
  side: THREE.DoubleSide,
  transparent: true,
  opacityNode: alpha,
});

onBeforeUnmount(() => {
  reflection.dispose();
  material.dispose();
});
</script>

<template>
  <TresMesh :material="material" :rotation-x="-Math.PI / 2">
    <TresPlaneGeometry :args="[size, size]" />
    <primitive :object="reflection.target" />
  </TresMesh>
</template>
