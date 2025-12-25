<script setup lang="ts">
import {motion} from "motion-v";

interface Props {
  index: number;
  src?: string;
  size: number;
  imageSize: number;
}

const props = defineProps<Props>();

const position = computed(() => {
  const row = Math.floor(props.index / props.size);
  const col = props.index % props.size;
  return {
    left: `-${(col * props.imageSize) / props.size}px`,
    top: `-${(row * props.imageSize) / props.size}px`,
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
  <div
    ref="el"
    class="aspect-square relative overflow-hidden"
    :style="{
      width: `${imageSize / size}px`,
    }"
  >
    <motion.div
      class="aspect-square bg-cover absolute"
      :style="{
        backgroundImage: `url('${src}')`,
        width: `${size * 100}%`,
        ...position,
      }"
      :animate="{
        x: speedX,
        y: speedY,
      }"
      :transition="{type: 'spring', stiffness: 300, damping: 10}"
    >
      <slot />
    </motion.div>
  </div>
</template>

<style scoped></style>
