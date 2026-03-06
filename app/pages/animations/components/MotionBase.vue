<script setup lang="ts">
import {motion} from "motion-v";
import CheckmarkIcon from "./CheckmarkIcon.vue";
import CopyIcon from "./CopyIcon.vue";
import SmoothButton from "./SmoothButton.vue";
const [isVisible, toggleVisibility] = useToggle(true);

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
  <div class="wrapper">
    <div class="grid place-items-center gap-4">
      <AnimatePresence>
        <motion.div
          v-if="isVisible"
          class="element"
          :initial="{
            opacity: 0,
            scale: 0,
          }"
          :animate="{
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              duration: 0.5,
              bounce: 0.5,
            },
          }"
          :exit="{
            opacity: 0,
            scale: 0,
          }"
        />
      </AnimatePresence>
      <button class="button cursor-pointer" @click="toggleVisibility()">
        toggle
      </button>
    </div>
    <div>
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
    </div>
    <SmoothButton />
  </div>
</template>

<style scoped>
.wrapper {
  display: grid;
  height: 100vh;
  width: 100vw;
  place-items: center;
  background: #0d0d0d;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.element {
  width: 48px;
  height: 48px;
  background: #fad658;
  border-radius: 12px;
}

.button {
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
}
</style>
