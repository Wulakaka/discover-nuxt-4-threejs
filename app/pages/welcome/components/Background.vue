<script setup lang="ts">
import {useBackground} from "../composables/useBackground";

const refCanvas = useTemplateRef<HTMLCanvasElement>("refCanvas");

useBackground(refCanvas);
</script>

<template>
  <div class="absolute inset-0">
    <canvas ref="refCanvas" class="w-full h-full" />
  </div>
</template>

<style scoped></style>
