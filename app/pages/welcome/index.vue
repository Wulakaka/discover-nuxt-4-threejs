<script setup lang="ts">
import Background from "./components/Background.vue";
import Cell from "./components/Cell.vue";
import VueLogo from "./components/VueLogo.vue";

// const img = useImage();

// const imgUrl = img("/image2.jpeg", {width: 400, height: 400});
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center">
    <div class="grid grid-cols-4 grid-rows-4 absolute z-1">
      <Cell
        v-for="(n, index) in 16"
        :key="n"
        :index="index"
        :src="undefined"
        :size="4"
        :image-size="400"
      >
        <VueLogo class="w-100" />
      </Cell>
    </div>
    <Background class="z-0" />
  </div>
</template>

<style scoped></style>
