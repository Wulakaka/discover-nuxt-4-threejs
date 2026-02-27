<script setup lang="ts">
defineProps<{
  index: number;
}>();
</script>

<template>
  <div class="toast" :style="{'--index': index}">
    <span class="title">Event Created {{ index }}</span>
    <span class="description">Monday, January 3rd at 6:00pm</span>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px 13px;
  width: 100%;
  font-size: 13px;
  border-radius: 8px;
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);

  position: absolute;
  bottom: 0;
  transform: translateY(calc((100% + var(--gap)) * var(--index) * -1));
  transition:
    transform 400ms ease,
    opacity 400ms ease;
}

@starting-style {
  .toast {
    transform: translateY(100%);
    opacity: 0;
  }
}

.title {
  font-weight: 500;
  color: #1b1b1d;
}

.description {
  font-weight: normal;
  line-height: 1;
  color: #717175;
}
</style>
