<script setup lang="ts">
import CoinIcon from "./CoinIcon.vue";
</script>

<template>
  <div
    class="w-14 aspect-square transform-3d animate-[coin_2s_linear_infinite] relative"
  >
    <div class="translate-z-0.75 absolute inset-0 rounded-full backface-hidden">
      <CoinIcon />
    </div>
    <div
      class="absolute inset-0 translate-z-0.75 w-full h-full bg-[#ffaa04] rounded-full backface-hidden rotate-y-180"
    />
    <div
      class="-translate-z-0.75 absolute inset-0 rounded-full backface-hidden rotate-y-180"
    >
      <CoinIcon />
    </div>
    <div
      class="absolute inset-0 -translate-z-0.75 w-full h-full bg-[#ffaa04] rounded-full backface-hidden"
    />
    <div
      class="w-1.5 h-14 bg-[#ffaa04] absolute left-1/2 top-1/2 -translate-y-1/2 rotate-y-90 -translate-x-1/2"
    />
  </div>
</template>

<style>
@keyframes coin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}
</style>
