<script setup lang="ts">
import {OrbitControls, Align} from "@tresjs/cientos";
import {PCDLoader} from "three/examples/jsm/Addons.js";

const {state, error, isLoading} = useLoader(PCDLoader, "/pcd/test.pcd");
</script>

<template>
  <div>
    <TresCanvas window-size>
      <TresPerspectiveCamera :position="[0, 0, 1]" :near="0.01" :far="100" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[3, 2, 1]" />
      <Align v-if="state" :center="[0, 0, 0]">
        <primitive
          :object="state"
          :scale="0.001"
          :rotation-x="-Math.PI / 2"
          dispose
        />
      </Align>
    </TresCanvas>
    <div class="absolute inset-0 z-10 text-white pointer-events-none">
      <p>error: {{ error }}</p>
      <p>isLoading: {{ isLoading }}</p>
    </div>
  </div>
</template>

<style scoped></style>
