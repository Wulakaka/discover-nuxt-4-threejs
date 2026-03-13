<script setup lang="ts">
import {MeshBasicNodeMaterial, WebGPURenderer} from "three/webgpu";
import {OrbitControls} from "@tresjs/cientos";
import {Fn, positionLocal, sin, time} from "three/tsl";
import type {TresRendererSetupContext} from "@tresjs/core";

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

const {node} = useMemoize(() => {
  const positionNode = Fn(() => {
    return positionLocal.add(sin(time).mul(0.1));
  });
  return {
    node: {
      positionNode,
    },
  };
})();

const material = new MeshBasicNodeMaterial({
  color: "hotpink",
  positionNode: node.positionNode(),
});
</script>

<template>
  <TresCanvas :renderer="createWebGPURenderer" window-size>
    <TresPerspectiveCamera :position="[3, 3, 3]" />
    <OrbitControls />
    <TresMesh :material="material">
      <TresBoxGeometry :args="[1, 1, 1]" />
    </TresMesh>
    <!-- Your 3D scene here -->
  </TresCanvas>
</template>
