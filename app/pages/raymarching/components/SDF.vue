<script setup lang="ts">
import * as THREE from "three";

import fragmentShader from "../shaders/fragment.glsl?raw";
import vertexShader from "../shaders/vertex.glsl?raw";

const uniforms = {
  uTime: new THREE.Uniform(0.0),
  uResolution: new THREE.Uniform(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
  ),
};

const {sizes} = useTres();

const scale = computed<[number, number, number]>(() => {
  return [sizes.width.value, sizes.height.value, 1];
});

const DPR = 0.75;
const {onRender} = useLoop();

onRender(({elapsed}) => {
  uniforms.uTime.value = elapsed;
  uniforms.uResolution.value.set(
    sizes.width.value * DPR,
    sizes.height.value * DPR,
  );
});
</script>

<template>
  <TresMesh :scale="scale">
    <TresPlaneGeometry :args="[1, 1]" />
    <TresShaderMaterial
      :fragment-shader="fragmentShader"
      :vertex-shader="vertexShader"
      :uniforms="uniforms"
    />
  </TresMesh>
</template>

<style scoped></style>
