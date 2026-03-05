<script setup lang="ts">
const text = "CLIP";

const [isLight, toggle] = useToggle(true);

const el = useTemplateRef("el");

watch(isLight, (val) => {
  if (el.value) {
    if (val) {
      el.value.animate(
        [{clipPath: "inset(0% 0% 100% 0%)"}, {clipPath: "inset(0% 0% 0% 0%)"}],
        {
          duration: 300,
          easing: "ease-in-out",
          fill: "forwards",
        },
      );
    } else {
      el.value.animate(
        [{clipPath: "inset(0% 0% 0% 0%)"}, {clipPath: "inset(100% 0% 0% 0%)"}],
        {
          duration: 300,
          easing: "ease-in-out",
          fill: "forwards",
        },
      );
    }
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="relative w-16 h-16">
      <div class="absolute inset-0 bg-white text-black">{{ text }}</div>
      <div ref="el" class="absolute inset-0 bg-blue-500 text-white">
        {{ text }}
      </div>
    </div>
    <button class="rounded-2xl border px-2" @click="toggle()">
      switch theme
    </button>
  </div>
</template>

<style scoped></style>
