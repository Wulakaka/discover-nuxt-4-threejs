<script setup lang="ts">
import {useExperience} from "./composables/useExperience";

const refCanvas = useTemplateRef<HTMLCanvasElement>("refCanvas");

useExperience(refCanvas);
</script>

<template>
  <div class="absolute inset-0 bg-[#222]">
    <canvas ref="refCanvas" class="w-full h-full" />
  </div>
</template>

<style scoped></style>
