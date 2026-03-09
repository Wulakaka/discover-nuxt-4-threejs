<script setup lang="ts">
import SmoothButton from "./SmoothButton.vue";
import DynamicHeight from "./DynamicHeight.vue";
import CopyButton from "./CopyButton.vue";
import CardLayout from "./CardLayout.vue";
</script>

<template>
  <div
    class="grid grid-cols-2 grid-rows-2 place-items-center bg-black w-screen h-screen"
  >
    <CopyButton />
    <SmoothButton />
    <DynamicHeight />
    <CardLayout />
  </div>
</template>

<style scoped></style>
