<script setup lang="ts">
import {Align} from "@tresjs/cientos";
import {
  type Mesh,
  type Vector2,
  type Points,
  type Object3D,
  type Box3,
  type Sphere,
  Vector3,
} from "three";
import {Raycaster} from "three";
import type {PointerEvent} from "@pmndrs/pointer-events";

interface Props {
  points: Points;
  pointer: Vector2;
}

const {points, pointer} = defineProps<Props>();

const raycaster = new Raycaster();
raycaster.params.Points.threshold = 0.01; // 默认值是 1

const alignPosition = new Vector3();

const position = shallowRef<[number, number, number]>([0, 0, 0]);

function onClick(e: PointerEvent<MouseEvent>) {
  console.log("Align Position:", alignPosition);
  raycaster.setFromCamera(pointer, e.camera);
  const intersection = raycaster.intersectObject(points)[0];
  if (intersection) {
    const point = points.geometry.attributes.position!;
    const x = point.getX(intersection.index!);
    const y = point.getY(intersection.index!);
    const z = point.getZ(intersection.index!);

    position.value = [
      x * 0.001 - alignPosition.x,
      y * 0.001 + alignPosition.z,
      z * 0.001 - alignPosition.y,
    ];

    // if (mark.value) {
    //   mark.value.position.set(...position);
    // }

    console.log(position.value);
  } else {
    console.log("No point intersected.");
  }
}
export interface AlignCallbackOptions {
  /** The next parent above <Align /> */
  parent: Object3D;
  /** The outmost container group of the <Align/> component */
  container: Object3D;
  width: number;
  height: number;
  depth: number;
  boundingBox: Box3;
  boundingSphere: Sphere;
  center: Vector3;
  verticalAlignment: number;
  horizontalAlignment: number;
  depthAlignment: number;
}
</script>

<template>
  <TresGroup>
    <Align
      v-if="points"
      @change="
        (v) => {
          alignPosition.copy(v.center);
        }
      "
    >
      <primitive
        :object="points"
        :scale="0.001"
        :rotation-x="-Math.PI / 2"
        dispose
        @click="onClick"
      />
    </Align>
    <TresMesh ref="mark" :position="position">
      <TresBoxGeometry :args="[0.01, 0.01, 0.01]" />
      <TresMeshBasicMaterial color="red" />
      <TresAxesHelper :args="[10]" />
    </TresMesh>
  </TresGroup>
</template>

<style scoped></style>
