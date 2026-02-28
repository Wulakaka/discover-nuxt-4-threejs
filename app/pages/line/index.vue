<script setup lang="ts">
import {OrbitControls} from "@tresjs/cientos";
import MovingLine from "./components/MovingLine.vue";
</script>

<template>
  <div class="overflow-hidden">
    <TresCanvas window-size>
      <TresPerspectiveCamera :position="[0, 0, 10]" :near="0.01" :far="100" />
      <OrbitControls />
      <MovingLine />
    </TresCanvas>
  </div>
</template>

<style scoped></style>
