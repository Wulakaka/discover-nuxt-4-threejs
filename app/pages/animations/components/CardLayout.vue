<script setup lang="ts">
import {motion} from "motion-v";
const [opened, toggle] = useToggle();
</script>

<template>
  <motion.div
    layout
    class="bg-yellow-300"
    :class="{
      'inset-0 w-full h-full fixed': opened,
      'w-14 h-14 rounded': !opened,
    }"
    @click="toggle()"
  />
</template>

<style scoped></style>
