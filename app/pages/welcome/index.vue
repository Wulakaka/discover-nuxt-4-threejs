<script setup lang="ts">
import Background from "./components/Background.vue";
import Cell from "./components/Cell.vue";

const img = useImage();

const imgUrl = img("/image2.jpeg", {width: 400, height: 400});
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div class="grid grid-cols-4 grid-rows-4">
      <Cell
        v-for="(n, index) in 16"
        :key="n"
        :index="index"
        :src="imgUrl"
        :size="4"
        :imageSize="400"
      />
    </div>
    <!-- <Background /> -->
  </div>
</template>

<style scoped></style>
