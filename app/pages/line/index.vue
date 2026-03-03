<script setup lang="ts">
import {OrbitControls} from "@tresjs/cientos";
import MovingLine from "./components/MovingLine.vue";
import csvFile from "@/assets/csv/trajectory.csv?url";
import * as d3 from "d3";

const data = ref<{x: string; y: string; z: string}[]>();
d3.csv<"x" | "y" | "z">(csvFile).then((csvData) => {
  data.value = csvData;
});
</script>

<template>
  <div class="overflow-hidden">
    <TresCanvas window-size>
      <TresPerspectiveCamera
        :position="[0, 100, 100]"
        :near="0.01"
        :far="1000"
      />
      <OrbitControls />
      <MovingLine v-if="data" :data="data" />
    </TresCanvas>
  </div>
</template>

<style scoped></style>
