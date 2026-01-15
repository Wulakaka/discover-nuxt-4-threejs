<script setup lang="ts">
import {Align} from "@tresjs/cientos";
import {Raycaster, Vector3} from "three";
import type {PointerEvent} from "@pmndrs/pointer-events";
import type {Vector2, Points} from "three";

interface Props {
  points: Points;
  pointer: Vector2;
}

const {points, pointer} = defineProps<Props>();

const raycaster = new Raycaster();
// 这里是关键点，设置较小阈值
raycaster.params.Points.threshold = 0.0005; // 默认值是 1

const alignPosition = new Vector3();

const position = shallowRef<[number, number, number]>([0, 0, 0]);

function onClick(e: PointerEvent<MouseEvent>) {
  raycaster.setFromCamera(pointer, e.camera);
  const intersection = raycaster.intersectObject(points)[0];
  if (intersection) {
    const point = points.geometry.attributes.position!;
    const x = point.getX(intersection.index!);
    const y = point.getY(intersection.index!);
    const z = point.getZ(intersection.index!);

    position.value = [
      x * 0.001 - alignPosition.x,
      y * 0.001 - alignPosition.y,
      z * 0.001 - alignPosition.z,
    ];

    console.log(position.value);
  } else {
    console.log("No point intersected.");
  }
}

function onAlignChange(options: {center: Vector3}) {
  console.log("Align changed:", options);
  alignPosition.copy(options.center);
}
</script>

<template>
  <TresGroup>
    <Align v-if="points" @change="onAlignChange">
      <primitive :object="points" :scale="0.001" dispose @click="onClick" />
    </Align>
    <TresMesh ref="mark" :position="position" :scale="0.001">
      <TresBoxGeometry />
      <TresMeshBasicMaterial color="red" />
      <TresAxesHelper :args="[10]" />
    </TresMesh>
  </TresGroup>
</template>

<style scoped></style>
