<script setup lang="ts">
import dayjs from "dayjs";
import type {Item} from "../types";
import {parser, y} from "../utils/y";

const props = defineProps<{
  data: Item;
}>();

const from = parser(props.data.from)!;

const to = dayjs(from).add(props.data.duration, "minute");
</script>

<template>
  <div
    class="absolute inset-x-0 px-2 rounded-lg text-white text-sm flex justify-evenly flex-col text-shadow-amber-950 text-shadow-md font-bold"
    :style="{
      top: y(from) + '%',
      height: y(to) - y(from) + '%',
    }"
    :class="data.class"
  >
    <div class="text-xl">
      {{ data.name }}
      <!-- <span class="font-semibold">{{ data.duration }} 分钟</span> -->
    </div>
    <div class="">
      <span>{{ dayjs(from).format("HH:mm") }}</span> -
      <span>{{ dayjs(to).format("HH:mm") }}</span>
    </div>
  </div>
</template>

<style scoped></style>
