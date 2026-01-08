<script setup lang="ts">
import {useExperience} from "./composables/useExperience";

const refCanvas = useTemplateRef<HTMLCanvasElement>("refCanvas");

useExperience(refCanvas);
</script>

<template>
  <ClientOnly>
    <div class="absolute inset-0 bg-[#202020]">
      <canvas ref="refCanvas" class="w-full h-full" />
    </div>
  </ClientOnly>
</template>

<style scoped></style>
