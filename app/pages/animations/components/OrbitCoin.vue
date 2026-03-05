<script setup lang="ts">
import CoinIcon from "./CoinIcon.vue";
</script>

<template>
  <div class="container">
    <div class="wrapper">
      <div class="coin-side" />
    </div>
    <div class="wrapper">
      <div class="coin outer front">
        <CoinIcon />
      </div>
      <div class="coin inner front" />
      <div class="coin outer back">
        <CoinIcon />
      </div>
      <div class="coin inner back" />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  height: 56px;
  width: 56px;
  position: absolute;
  transform-style: preserve-3d;
  animation: rotate 2s infinite linear;
}

.container {
  height: 74px;
  width: 74px;
  position: relative;
}

.coin {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 50%;
  background: #ffcd6c;
}

.outer {
  transform: translateZ(3px);
}

.front {
  transform: translateZ(3px);
}

.front.inner {
  background: #ffaa04;
  transform: rotateY(180deg) translateZ(-3px);
}

.back.inner {
  background: #ffaa04;
  transform: translateZ(-3px);
}

.back {
  transform: rotateY(180deg) translateZ(3px);
}

.coin-side {
  position: absolute;
  border-radius: 0;
  transform: translateX(26px) rotateY(90deg);
  width: 6px;
  height: 56px;
  background: #ffaa04;
}

@keyframes rotate {
  to {
    transform: rotateY(360deg);
  }
}
</style>
