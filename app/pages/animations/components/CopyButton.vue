<script setup lang="ts">
import {motion} from "motion-v";
import CheckmarkIcon from "./CheckmarkIcon.vue";
import CopyIcon from "./CopyIcon.vue";

const variants = {
  hidden: {opacity: 0, scale: 0.5},
  visible: {opacity: 1, scale: 1},
};

const copied = ref(false);

function copy() {
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <button
    class="bg-gray-100 flex size-8 items-center justify-center rounded-md text-gray-1100 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-1200"
    aria-label="Copy code snippet"
    @click="copy"
  >
    <AnimatePresence mode="wait" :initial="false">
      <motion.span
        v-if="copied"
        key="checkmark"
        :variants="variants"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <CheckmarkIcon class="size-5" />
      </motion.span>
      <motion.span
        v-else
        key="copy"
        :variants="variants"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <CopyIcon class="size-5" />
      </motion.span>
    </AnimatePresence>
  </button>
</template>

<style scoped></style>
