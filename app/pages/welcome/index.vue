<script setup lang="ts">
// import {useMouse, useRafFn} from "@vueuse/core";

const {x, y} = useMouse();
const deltaX = ref(0);
watch(x, (newX, oldX) => {
  deltaX.value = newX - oldX;
});

// const speedX = ref(0);

// useRafFn(
//   ({delta}) => {
//     // console.log("raf delta", deltaX.value / delta);
//     speedX.value = deltaX.value / delta;
//   },
//   {
//     fpsLimit: 60,
//   }
// );
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <div class="w-25 aspect-square outline-amber-300 outline-2">
      pos: {{ x }}, {{ y }}
    </div>
  </div>
</template>

<style scoped></style>
