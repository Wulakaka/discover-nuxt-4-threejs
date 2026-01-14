<script setup lang="ts">
import {Align} from "@tresjs/cientos";
import type {Vector2, Points} from "three";
import {Raycaster} from "three";
import type {PointerEvent} from "@pmndrs/pointer-events";

interface Props {
  points: Points;
  pointer: Vector2;
}

const {points, pointer} = defineProps<Props>();

const raycaster = new Raycaster();
raycaster.params.Points.threshold = 0.01; // 默认值是 1

function onClick(e: PointerEvent<MouseEvent>) {
  raycaster.setFromCamera(pointer, e.camera);
  const intersection = raycaster.intersectObject(points)[0];
  if (intersection) {
    const point = points.geometry.attributes.position!;
    const x = point.getX(intersection.index!);
    const y = point.getY(intersection.index!);
    const z = point.getZ(intersection.index!);
    console.log(`Coordinates: x=${x}, y=${y}, z=${z}`);
  } else {
    console.log("No point intersected.");
  }
}
</script>

<template>
  <Align v-if="points">
    <primitive
      :object="points"
      :scale="0.001"
      :rotation-x="-Math.PI / 2"
      dispose
      @click="onClick"
    />
  </Align>
</template>

<style scoped></style>
