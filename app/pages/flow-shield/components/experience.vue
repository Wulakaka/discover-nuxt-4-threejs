<script setup lang="ts">
import {TresCanvas} from "@tresjs/core";
import {OrbitControls} from "@tresjs/cientos";
import type {TresRendererSetupContext} from "@tresjs/core";
import {WebGPURenderer, NoToneMapping} from "three/webgpu";

import TheShield from "../components/TheShield.vue";
import TheReflectiveGrid from "../components/TheReflectiveGrid.vue";
import {Inspector} from "three/addons/inspector/Inspector.js";
import {INSPECTOR_KEY} from "../INJECTION_KEYS.js";

const inspector = new Inspector();

provide(INSPECTOR_KEY, inspector);

// Create WebGPU renderer factory
const createWebGPURenderer = (ctx: TresRendererSetupContext) => {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    // WebGPU specific configuration
    alpha: true,
    antialias: true,
  });

  renderer.inspector = inspector;
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
    <TheReflectiveGrid />
    <TheShield />
  </TresCanvas>
</template>

<style scoped></style>
