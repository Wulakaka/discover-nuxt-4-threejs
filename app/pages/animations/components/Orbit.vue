<script setup lang="ts"></script>

<template>
  <div class="transform-3d perspective-midrange">
    <div class="circle" />
    <div class="orbitingCircle" />
  </div>
</template>

<style scoped>
.circle {
  height: 96px;
  width: 96px;
  border-radius: 50%;
  background: #21201c;
}

.orbitingCircle {
  width: 32px;
  height: 32px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateZ(800px);
  border-radius: 50%;
  background: #fad757;
  animation: orbit 6s linear infinite;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateY(0deg) translateZ(70px)
      rotateY(360deg);
  }

  to {
    transform: translate(-50%, -50%) rotateY(360deg) translateZ(70px)
      rotateY(0deg);
  }
}
</style>
