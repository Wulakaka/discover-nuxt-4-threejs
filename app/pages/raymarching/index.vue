<script setup lang="ts">
import {TresCanvas} from "@tresjs/core";
import {OrbitControls} from "@tresjs/cientos";

import SDF from "./components/SDF.vue";

const DPR = 0.75;
</script>

<template>
  <TresCanvas window-size :dpr="DPR">
    <TresPerspectiveCamera :position="[0, 0, 6]" />
    <OrbitControls />
    <!-- <Box /> -->
    <SDF />
  </TresCanvas>
</template>

<style scoped></style>
