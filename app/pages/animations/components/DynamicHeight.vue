<script setup lang="ts">
import {motion} from "motion-v";
const [showExtraContent, toggle] = useToggle(false);

const el = useTemplateRef("el");
const {height} = useElementBounding(el);
</script>

<template>
  <div class="grid place-items-center gap-4">
    <button class="button" @click="toggle()">Toggle height</button>
    <motion.div
      class="element"
      :animate="{
        height: height,
      }"
    >
      <div ref="el" class="inner">
        <h1>Fake Family Drawer {{ height }}</h1>
        <p>
          This is a fake family drawer. Animating height is tricky, but
          satisfying when it works.
        </p>
        <template v-if="showExtraContent">
          <p>
            This extra content will change the height of the drawer. Some even
            more content to make the drawer taller and taller and taller...
          </p>
        </template>
      </div>
    </motion.div>
  </div>
</template>

<style scoped>
.element {
  background: white;
  border-radius: 16px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}

.inner {
  padding: 13px 16px;
}

.element h1 {
  font-weight: 600;
}

.element p {
  color: #63635d;
}

.button {
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
}
</style>
