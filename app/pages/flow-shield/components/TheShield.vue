<script setup lang="ts">
import {color} from "three/tsl";
import * as THREE from "three/webgpu";

const c = new THREE.Color("#00ff00");

const outColor = color(c);

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: outColor,
});
</script>

<template>
  <TresMesh :material="material" :position-y="1">
    <TresSphereGeometry />
  </TresMesh>
</template>

<style scoped></style>
