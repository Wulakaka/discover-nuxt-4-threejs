<script setup lang="ts">
import {WebGPURenderer} from "three/webgpu";
import {OrbitControls} from "@tresjs/cientos";
import type {TresRendererSetupContext} from "@tresjs/core";
import TheMesh from "./components/the-mesh.vue";

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
  <TresCanvas :renderer="createWebGPURenderer" window-size>
    <TresPerspectiveCamera :position="[3, 3, 3]" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="2" />
    <TresAmbientLight :intensity="0.5" />
    <OrbitControls />
    <TheMesh />
    <!-- Your 3D scene here -->
  </TresCanvas>
</template>
