<script setup lang="ts">
import Cell from "./components/Cell.vue";
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div class="grid grid-cols-3 grid-rows-3">
      <Cell v-for="n in 9" :key="n" />
    </div>
  </div>
</template>

<style scoped></style>
