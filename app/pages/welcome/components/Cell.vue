<script setup lang="ts">
import {motion} from "motion-v";
let lastX = 0;
let lastY = 0;
const speedX = ref(0);
const speedY = ref(0);

const {x: mouseX, y: mouseY} = useMouse();

const el = useTemplateRef("el");
const {top, right, bottom, left} = useElementBounding(el);

const distance = 100;
const inRange = computed(() => {
  return (
    mouseX.value + distance > left.value &&
    mouseX.value - distance < right.value &&
    mouseY.value + distance > top.value &&
    mouseY.value - distance < bottom.value
  );
});

useRafFn(({delta}) => {
  const newX = mouseX.value;
  const newY = mouseY.value;
  if (inRange.value) {
    speedX.value = Math.round(((newX - lastX) / (delta || 1)) * 10);
    speedY.value = Math.round(((newY - lastY) / (delta || 1)) * 10);
  } else {
    speedX.value = 0;
    speedY.value = 0;
  }
  lastX = newX;
  lastY = newY;
});
</script>

<template>
  <motion.div
    ref="el"
    class="w-25 aspect-square outline-amber-300 outline-2"
    :animate="{
      x: speedX,
      y: speedY,
    }"
    :transition="{type: 'spring', stiffness: 300, damping: 30}"
    >{{ inRange }}</motion.div
  >
</template>

<style scoped></style>
