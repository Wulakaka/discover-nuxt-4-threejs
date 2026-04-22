<script setup lang="tsx">
import {AnimatePresence, motion, MotionConfig, type Options} from "motion-v";

const currentStep = ref(0);

type Direction = 1 | -1;

const direction = ref<Direction>(1);

const el = useTemplateRef("el");
const {height} = useElementBounding(el);

const content = computed(() => {
  switch (currentStep.value) {
    case 0:
      return (
        <>
          <h2 class="heading">This is step one</h2>
          <p>
            Usually in this step we would explain why this thing exists and what
            it does. Also, we would show a button to go to the next step.
          </p>
          <div class="skeletons">
            <div class="skeleton" style={{width: "256px"}} />
            <div class="skeleton" style={{width: "192px"}} />
            <div class="skeleton" />
            <div class="skeleton" style={{width: "384px"}} />
          </div>
        </>
      );
    case 1:
      return (
        <>
          <h2 class="heading">This is step two</h2>
          <p>
            Usually in this step we would explain why this thing exists and what
            it does. Also, we would show a button to go to the next step.
          </p>
          <div class="skeletons">
            <div class="skeleton" style={{width: "256px"}} />
            <div class="skeleton" style={{width: "192px"}} />
            <div class="skeleton" style={{width: "384px"}} />
          </div>
        </>
      );
    case 2:
      return (
        <>
          <h2 class="heading">This is step three</h2>
          <p>
            Usually in this step we would explain why this thing exists and what
            it does. Also, we would show a button to go to the next step.
          </p>
          <div class="skeletons">
            <div class="skeleton" style={{width: "256px"}} />
            <div class="skeleton" style={{width: "192px"}} />
            <div class="skeleton" style={{width: "128px"}} />
            <div class="skeleton" style={{width: "224px"}} />
            <div class="skeleton" style={{width: "384px"}} />
          </div>
        </>
      );

    default:
      return null;
  }
});

const variants: Options["variants"] = {
  initial: (direction) => ({
    x: `${110 * direction}%`,
    opacity: 0,
  }),
  animate: {x: 0, opacity: 1},
  exit: (direction) => ({x: `${-110 * direction}%`, opacity: 0}),
};
</script>

<template>
  <MotionConfig :transition="{duration: 0.5, type: 'spring', bounce: 0}">
    {{ direction }}
    <motion.div :animate="{height}" class="multi-step-wrapper">
      <div ref="el" class="multi-step-inner">
        <AnimatePresence mode="popLayout" :initial="false" :custom="direction">
          <motion.div
            :key="currentStep"
            :variants="variants"
            :custom="direction"
            initial="initial"
            animate="animate"
            exit="exit"
            class="multi-step-content"
          >
            <component :is="content" />
          </motion.div>
        </AnimatePresence>
        <motion.div class="actions" layout>
          <button
            class="secondary-button"
            :disabled="currentStep === 0"
            @click="
              () => {
                if (currentStep === 0) {
                  return;
                }
                direction = -1;
                currentStep--;
              }
            "
          >
            Back
          </button>
          <button
            class="primary-button"
            :disabled="currentStep === 2"
            @click="
              () => {
                if (currentStep === 2) {
                  currentStep = 0;
                  direction = -1;
                  return;
                }
                direction = 1;
                currentStep++;
              }
            "
          >
            Continue
          </button>
        </motion.div>
      </div>
    </motion.div>
  </MotionConfig>
</template>

<style scoped>
.multi-step-wrapper {
  position: relative;
  margin: 100px auto;
  width: 550px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04),
    0px 8px 8px -8px rgba(0, 0, 0, 0.04);
}

.multi-step-inner {
  padding: 24px;
}

.actions {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.secondary-button {
  height: 32px;
  width: 80px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #63635d;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04),
    0px 8px 8px -8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.secondary-button:hover:not(:disabled) {
  color: black;
}

.primary-button {
  border-radius: 9999px;
  font-weight: 600;
  font-size: 14px;
  height: 32px;
  width: 120px;
  color: white;
  overflow: hidden;
  background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
  box-shadow:
    0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
    0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
    0px 0px 0px 0.5px #1a94ff;
  position: relative;
}

.primary-button span {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
}

.heading {
  margin-bottom: 8px;
  font-weight: 600;
}

.skeletons {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton {
  border-radius: 6px;
  background: #f2f1f0;
  height: 16px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
