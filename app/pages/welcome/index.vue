<script setup lang="ts">
import {motion} from "motion-v";
let lastX = 0;
let lastY = 0;
const speedX = ref(0);
const speedY = ref(0);

const {x, y} = useMouse();

useRafFn(({delta}) => {
  const newX = x.value;
  const newY = y.value;
  speedX.value = (newX - lastX) / delta;
  speedY.value = (newY - lastY) / delta;
  lastX = newX;
  lastY = newY;
});
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <motion.div
      class="w-25 aspect-square outline-amber-300 outline-2"
      :style="{
        x: speedX + 'px',
        y: speedY + 'px',
      }"
      :animate="['x', 'y']"
    />
  </div>
</template>

<style scoped></style>
