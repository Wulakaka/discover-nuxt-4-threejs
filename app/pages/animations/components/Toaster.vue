<script setup lang="ts">
import Toast from "./Toast.vue";
const toasts = ref(0);

function setToasts(count: number) {
  toasts.value = count;
}
</script>

<template>
  <div class="wrapper">
    <div class="toaster flex flex-col-reverse">
      <Toast v-for="i in toasts" :key="i" :index="toasts - i" />
    </div>
    <button class="button" @click="setToasts(toasts + 1)">Add toast</button>
  </div>
</template>

<style scoped>
.toaster {
  position: absolute;
  left: 50%;
  bottom: 80px;

  gap: var(--gap);
  width: 356px;
  transform: translateX(-50%);
  --gap: 16px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  padding-inline: 12px;
  width: auto;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04);
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 100%;
}
</style>
