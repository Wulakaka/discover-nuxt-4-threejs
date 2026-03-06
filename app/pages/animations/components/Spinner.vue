<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
    color: string;
  }>(),
  {
    size: 20,
  },
);

const bars = Array(12).fill(0);
</script>

<template>
  <div
    class="w-(--spinner-size,20px) h-(--spinner-size,20px)"
    :style="{
      '--spinner-size': `${size}px`,
      '--spinner-color': color,
    }"
  >
    <div
      class="w-(--spinner-size,20px) h-(--spinner-size,20px) relative top-1/2 left-1/2"
    >
      <div
        v-for="(_, i) in bars"
        :key="`spinner-bar-${i}`"
        class="bar transform-[rotate(var(--spinner-rotate))_translate(146%)]"
        :style="{
          '--spinner-delay': `${-1.2 + i * 0.1}s`,
          '--spinner-rotate': `${i * 30}deg`,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.bar {
  animation: spin 1.2s linear infinite var(--spinner-delay);
  background: var(--spinner-color);
  border-radius: 6px;
  height: 8%;
  left: -10%;
  position: absolute;
  top: -3.9%;
  width: 24%;
}

@keyframes spin {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.15;
  }
}
</style>
