<script setup lang="ts">
import Background from "./components/Background.vue";
import Cell from "./components/Cell.vue";
import VueLogo from "./components/VueLogo.vue";

const enabled = ref(false);

// const img = useImage();

// const imgUrl = img("/image2.jpeg", {width: 400, height: 400});
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-black">
    <Background class="z-1" />
    <div class="grid grid-cols-4 grid-rows-4 absolute z-0">
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
    <FluidCursor
      v-if="enabled"
      :splat-radius="0.2"
      :color-update-speed="3"
      :velocity-dissipation="3"
      :sim-resolution="64"
    />
  </div>
</template>

<style scoped></style>
