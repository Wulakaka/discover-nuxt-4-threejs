<script setup lang="ts">
import {OrbitControls} from "@tresjs/cientos";
import {PCDLoader} from "three/examples/jsm/Addons.js";
import Points from "./components/Points.vue";
import {Vector2} from "three";

const {state: points, error, isLoading} = useLoader(PCDLoader, "/pcd/test.pcd");

whenever(points, (v) => {
  console.log(v.material.size);
  v.material.size = 0.001;
  // v.material.sizeAttenuation = false;
});

const pointer = new Vector2();

function onMouseMove(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
</script>

<template>
  <div @mousemove="onMouseMove">
    <TresCanvas window-size>
      <TresPerspectiveCamera :position="[0, 0, 1]" :near="0.01" :far="100" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[3, 2, 1]" />
      <Points v-if="points" :points="points" :pointer="pointer" />
    </TresCanvas>
    <div class="absolute inset-0 z-10 text-white pointer-events-none">
      <p>error: {{ error }}</p>
      <p>isLoading: {{ isLoading }}</p>
    </div>
  </div>
</template>

<style scoped></style>
