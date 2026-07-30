<script setup lang="ts">
import {color, uniform} from "three/tsl";
import * as THREE from "three/webgpu";
import {INSPECTOR_KEY} from "../INJECTION_KEYS";

const inspector = inject(INSPECTOR_KEY);

const gui = inspector?.createParameters("Params");

const uColor = uniform(new THREE.Color("#00ff00"));

gui?.addColor(uColor, "value").name("Sphere Color");

const outColor = color(uColor);

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
