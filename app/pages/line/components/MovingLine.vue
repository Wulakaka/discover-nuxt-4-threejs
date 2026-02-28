<script setup lang="ts">
import pointList from "@/assets/json/points.json";
import {Line2} from "@tresjs/cientos";

const positions = pointList.flatMap((p) => [p.x, p.y, p.z]);

const dashOffset = ref(0);

const {onRender} = useLoop();

onRender(({delta}) => {
  dashOffset.value -= delta * 5;
});
</script>

<template>
  <Line2
    :points="positions"
    color="orange"
    :line-width="5"
    dashed
    :gap-size="0.2"
    :dash-offset="dashOffset"
    alpha-to-coverage
  />
</template>

<style scoped></style>
