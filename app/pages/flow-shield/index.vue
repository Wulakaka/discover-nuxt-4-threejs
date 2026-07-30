<script setup lang="ts">
import {TresCanvas} from "@tresjs/core";
import {OrbitControls} from "@tresjs/cientos";
import type {TresRendererSetupContext} from "@tresjs/core";
import {WebGPURenderer, NoToneMapping} from "three/webgpu";

import TheShield from "./components/TheShield.vue";
import TheGrid from "../../components/TheGrid.vue";

// Create WebGPU renderer factory
const createWebGPURenderer = (ctx: TresRendererSetupContext) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    // WebGPU specific configuration
    alpha: true,
    antialias: true,
  });
  return renderer;
};
</script>

<template>
  <TresCanvas
    :renderer="createWebGPURenderer"
    :tone-mapping="NoToneMapping"
    shadows
    window-size
  >
    <TresPerspectiveCamera :position="[8, 5, 8]" :fov="50" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 3]" :intensity="1.5" cast-shadow />
    <TheGrid />
    <!-- <TresMesh>
      <TresSphereGeometry :args="[1.8, 64, 64]" />
      <TresMeshStandardMaterial color="red" />
    </TresMesh> -->
    <TheShield />
  </TresCanvas>
</template>

<style scoped></style>
