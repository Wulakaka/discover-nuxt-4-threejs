<script setup lang="ts"></script>

<template>
  <div class="transform-3d perspective-midrange">
    <svg class="w-35 aspect-square block rounded-full" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="70" fill="white" />
      <circle
        class="dash-circle"
        cx="70"
        cy="70"
        r="60"
        fill="none"
        stroke="#612d1a"
        stroke-width="10"
      />
      <circle class="inner-circle" cx="70" cy="70" r="0" fill="#ec5432" />
    </svg>
    <svg
      class="w-32 aspect-square block rounded-full orbitingCircle"
      viewBox="0 0 128 128"
    >
      <circle cx="64" cy="64" r="60" fill="white" />
      <circle
        class="orbit-inner"
        cx="64"
        cy="64"
        r="36"
        stroke="#ec5432"
        fill="none"
        stroke-width="16"
      />
    </svg>
  </div>
</template>

<style scoped>
.dash-circle,
.inner-circle {
  animation-duration: 5s;
  transform-origin: center;
  animation-fill-mode: forwards;
}

.dash-circle {
  animation-name: dash-circle;
  animation-timing-function: linear;
}

@keyframes dash-circle {
  from {
  }

  80% {
    stroke-dasharray: 5 10;
  }

  90% {
    stroke-dasharray: 15 0;
  }

  100% {
    transform: rotate(360deg);
  }
}

.inner-circle {
  animation-name: inner-circle;
  animation-timing-function: ease-out;
}

@keyframes inner-circle {
  80% {
    r: 0;
  }

  90% {
    r: 40;
  }

  100% {
    r: 40;
  }
}

.orbitingCircle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateZ(800px);
  animation: orbit 5s linear;
}

@keyframes orbit {
  from {
    transform: translate(-50%, -50%) rotateZ(-45deg) rotateY(0deg)
      translateZ(150px) rotateY(-720deg);
  }

  90% {
    transform: translate(-50%, -50%) rotateZ(-45deg) rotateY(-720deg)
      translateZ(150px) rotateY(0deg);
  }

  100% {
    transform: translate(-50%, -50%) rotateZ(-45deg) rotateY(-720deg)
      translateZ(150px) rotateY(0deg);
  }
}

.orbit-inner {
  animation-duration: 5s;
  animation-name: orbit-inner;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes orbit-inner {
  90% {
    stroke: #ec5432;
    stroke-width: 16;
    r: 36;
  }
  100% {
    stroke: #555bc9;
    stroke-width: 44;
    r: 22;
  }
}
</style>
