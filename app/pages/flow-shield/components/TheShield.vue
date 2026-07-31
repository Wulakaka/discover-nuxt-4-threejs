<script setup lang="ts">
import {
  color,
  float,
  normalView,
  positionViewDirection,
  pow,
  uniform,
} from "three/tsl";
import * as THREE from "three/webgpu";
import {INSPECTOR_KEY} from "../INJECTION_KEYS";

const inspector = inject(INSPECTOR_KEY);

const gui = inspector?.createParameters("Params");

const uColor = uniform(new THREE.Color("#00ff00"));

const uFresnelPower = uniform(1.8);

const uFresnelStrength = uniform(float(1.0));

gui?.addColor(uColor, "value").name("Sphere Color");
gui?.add(uFresnelPower, "value", 0.5, 5, 0.1).name("Fresnel Power");

const outColor = color(uColor);

// ── Fresnel ───────────────────────────────────────────────────────────────
const fresnel = pow(
  normalView.dot(positionViewDirection).oneMinus(),
  uFresnelPower,
).mul(uFresnelStrength);

const material = new THREE.MeshBasicNodeMaterial({
  colorNode: outColor,
  opacityNode: fresnel,
  transparent: true,
});
</script>

<template>
  <TresMesh :material="material" :position-y="1">
    <TresSphereGeometry />
  </TresMesh>
</template>

<style scoped></style>
