<script setup lang="ts">
import {motion} from "motion-v";

interface Props {
  index: number;
  src: string;
  size: number;
}

const props = defineProps<Props>();

const position = computed(() => {
  const row = Math.floor(props.index / props.size);
  const col = props.index % props.size;
  return {
    left: `-${(col * 400) / props.size}px`,
    top: `-${(row * 400) / props.size}px`,
  };
});

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
  <div ref="el" class="w-25 aspect-square relative overflow-hidden">
    <motion.div
      class="w-[400%] aspect-square bg-cover absolute"
      :style="{
        backgroundImage: `url('${src}')`,
        ...position,
      }"
      :animate="{
        x: speedX,
        y: speedY,
      }"
      :transition="{type: 'spring', stiffness: 300, damping: 10}"
    />
  </div>
</template>

<style scoped></style>
