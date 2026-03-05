<script setup lang="ts">
const el = useTemplateRef("el");

const parent = useTemplateRef("parent");

const {x, style} = useDraggable(el, {
  containerElement: parent,
  preventDefault: true,
});

const percent = computed(() => {
  if (!parent.value) return 0;
  const parentRect = parent.value.getBoundingClientRect();
  return (1 - x.value / (parentRect.width - 8)) * 100;
});
</script>

<template>
  <div ref="parent" class="relative px-1 text-6xl">
    <div
      class="w-200 h-140 bg-amber-200 flex justify-center items-center text-blue-300"
    >
      {{ x }}
    </div>
    <div
      class="absolute inset-x-1 inset-y-0 bg-blue-300 flex justify-center items-center text-amber-200"
      :style="{
        'clip-path': `inset(0% ${percent}% 0% 0%)`,
      }"
    >
      {{ x }}
    </div>
    <div
      ref="el"
      class="absolute h-full w-2 bg-gray-600 opacity-10 hover:opacity-100 cursor-col-resize transition-opacity duration-150"
      :style="style"
    />
  </div>
</template>

<style scoped></style>
