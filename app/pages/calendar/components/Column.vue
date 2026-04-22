<script setup lang="ts">
import Cell from "./Cell.vue";
import type {ItemGroup} from "@/types";

defineProps<{
  data: ItemGroup;
}>();
</script>

<template>
  <div class="bg-gray-100 rounded-3xl p-2 relative flex flex-col">
    <div class="text-center py-4 font-bold text-3xl text-gray-700">
      {{ data.name }}
    </div>
    <div class="grow relative">
      <Cell v-for="(i, index) in data.children" :key="index" :data="i" />
    </div>
  </div>
</template>

<style scoped></style>
