<script setup lang="ts">
import Column from "./components/Column.vue";
import {list} from "./data";
</script>

<template>
  <div class="w-screen h-screen grid grid-cols-7 gap-6 p-8">
    <Column v-for="(item, index) in list" :key="index" :data="item" />
  </div>
</template>

<style scoped></style>
