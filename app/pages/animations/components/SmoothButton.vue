<script setup lang="ts">
import Spinner from "./Spinner.vue";
import {motion} from "motion-v";

const buttonCopy = {
  idle: () => h("span", "Send me a login link"),
  loading: () => h(Spinner, {size: 16, color: "rgba(255, 255, 255, 0.65)"}),
  success: () => h("span", "Login link sent!"),
};

const variants = {
  initial: {
    y: -25,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: 25,
    opacity: 0,
  },
};

const buttonState = ref<keyof typeof buttonCopy>("idle");

function setButtonState(state: keyof typeof buttonCopy) {
  buttonState.value = state;
}

function handleClick() {
  // This code is just a placeholder
  setButtonState("loading");

  setTimeout(() => {
    setButtonState("success");
  }, 1750);

  setTimeout(() => {
    setButtonState("idle");
  }, 3500);
}
</script>

<template>
  <div class="outer-wrapper">
    <button
      class="blue-button"
      :disabled="buttonState !== 'idle'"
      @click="handleClick"
    >
      <AnimatePresence :initial="false" mode="popLayout">
        <motion.span
          :key="buttonState"
          :variants="variants"
          initial="initial"
          animate="animate"
          exit="exit"
          :transition="{type: 'spring', duration: 0.3, bounce: 0}"
        >
          <component :is="buttonCopy[buttonState]" />
        </motion.span>
      </AnimatePresence>
    </button>
  </div>
</template>

<style scoped>
.blue-button {
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  height: 32px;
  width: 148px;
  overflow: hidden;
  background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
  box-shadow:
    0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
    0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
    0px 0px 0px 0.5px #1a94ff;
  position: relative;
}

.blue-button span {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
}

.outer-wrapper {
  display: flex;
  padding: 120px 40px;
  justify-content: center;
}
</style>
