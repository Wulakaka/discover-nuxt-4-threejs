<script setup lang="ts">
import {TresCanvas} from "@tresjs/core";
import {OrbitControls} from "@tresjs/cientos";

import Experience from "./components/experience.vue";
</script>

<template>
  <TresCanvas shadows window-size>
    <TresPerspectiveCamera :position="[8, 5, 8]" :fov="50" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 3]" :intensity="1.5" cast-shadow />
    <Experience />
  </TresCanvas>
</template>

<style scoped></style>
