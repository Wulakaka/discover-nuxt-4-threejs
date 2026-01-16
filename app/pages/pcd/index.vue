<script setup lang="ts">
import {OrbitControls} from "@tresjs/cientos";
import {PCDLoader} from "three/examples/jsm/Addons.js";
import Points from "./components/Points.vue";
import {Vector2} from "three";
import type {Vector3} from "three";

const {state: points, error, isLoading} = useLoader(PCDLoader, "/pcd/test.pcd");

whenever(points, (v) => {
  // console.log(v.material.size);
  v.material.size = 10;
  v.material.sizeAttenuation = false;
});

const pointer = new Vector2();

const selectedPoint = ref<Vector3 | null>(null);

function onMouseMove(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
</script>

<template>
  <div class="overflow-hidden" @mousemove="onMouseMove">
    <TresCanvas window-size>
      <TresPerspectiveCamera :position="[0, 0, 0.5]" :near="0.01" :far="100" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[3, 2, 1]" />
      <Points
        v-if="points"
        :points="points"
        :pointer="pointer"
        @select="selectedPoint = $event"
      />
    </TresCanvas>
    <div
      ref="refInfo"
      class="absolute inset-0 z-10 text-white pointer-events-none text-shadow-[1px_1px_2px_black]"
    >
      <p>error: {{ error }}</p>
      <p>isLoading: {{ isLoading }}</p>
      <div v-if="selectedPoint">
        <p>X: {{ selectedPoint.x }}</p>
        <p>Y: {{ selectedPoint.y }}</p>
        <p>Z: {{ selectedPoint.z }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
