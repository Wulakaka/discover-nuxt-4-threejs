<script setup lang="ts">
import {Align} from "@tresjs/cientos";
import {
  BufferAttribute,
  BufferGeometry,
  PointsMaterial,
  Raycaster,
  Vector3,
  Points,
} from "three";
import type {PointerEvent} from "@pmndrs/pointer-events";
import type {Vector2} from "three";

interface Props {
  points: Points;
  pointer: Vector2;
}

interface Emits {
  select: [info: Vector3 | null];
}

const {points, pointer} = defineProps<Props>();

const emit = defineEmits<Emits>();

const raycaster = new Raycaster();
// 这里是关键点，设置较小阈值
raycaster.params.Points.threshold = 0.0005; // 默认值是 1

const alignPosition = new Vector3();

const position = shallowRef<[number, number, number]>([0, 0, 0]);

const markGeometry = new BufferGeometry();
const positions = new Float32Array([0, 0, 0]);
markGeometry.setAttribute("position", new BufferAttribute(positions, 3));

const mark = new Points(
  markGeometry,
  new PointsMaterial({
    color: "blue",
    size: 12,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: false,
  })
);

mark.renderOrder = 1;

function onClick(e: PointerEvent<MouseEvent>) {
  raycaster.setFromCamera(pointer, e.camera);
  const intersection = raycaster.intersectObject(points)[0];
  if (intersection) {
    const point = points.geometry.attributes.position!;
    const x = point.getX(intersection.index!);
    const y = point.getY(intersection.index!);
    const z = point.getZ(intersection.index!);

    emit("select", new Vector3(x, y, z));

    // 由于 x 轴旋转了 -90 度，这里需要调整坐标轴
    position.value = [
      x * 0.001 - alignPosition.x,
      z * 0.001 - alignPosition.y,
      -y * 0.001 - alignPosition.z,
    ];
  } else {
    emit("select", null);
  }
}

function onAlignChange(options: {center: Vector3}) {
  // console.log("Align changed:", options);
  alignPosition.copy(options.center);
}
</script>

<template>
  <TresGroup>
    <Align v-if="points" @change="onAlignChange">
      <primitive
        :object="points"
        :scale="0.001"
        dispose
        :rotation-x="-Math.PI / 2"
        @click="onClick"
      />
    </Align>
    <primitive :object="mark" :position="position" />
  </TresGroup>
</template>

<style scoped></style>
