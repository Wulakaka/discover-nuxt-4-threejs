<script setup lang="ts">
import {Align} from "@tresjs/cientos";
import {
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import type {PointerEvent} from "@pmndrs/pointer-events";
import type {Points} from "three";

interface Props {
  points: Points;
}

const {points} = defineProps<Props>();

const positions = points.geometry.attributes.position!;
const colors = points.geometry.attributes.color!;
const count = positions.count;

const mesh = new InstancedMesh(
  new PlaneGeometry(),
  new MeshBasicMaterial({
    side: 2,
  }),
  count
);

const matrix = new Matrix4();

const quaternion = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0));

for (let i = 0; i < count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  const z = positions.getZ(i);

  matrix.compose(new Vector3(x, y, z), quaternion, new Vector3(1, 1, 1));
  mesh.setMatrixAt(i, matrix);

  mesh.setColorAt(i, new Color(colors.getX(i), colors.getY(i), colors.getZ(i)));
}

// const raycaster = new Raycaster();
// // 这里是关键点，设置较小阈值
// raycaster.params.Points.threshold = 0.0005; // 默认值是 1

const alignPosition = new Vector3();

const position = shallowRef<[number, number, number]>([0, 0, 0]);

function onClick(e: PointerEvent<MouseEvent>) {
  console.log(e);
  // raycaster.setFromCamera(pointer, e.camera);
  const intersection = e.intersection;
  if (intersection) {
    const index = intersection.instanceId!;
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    // 由于 x 轴旋转了 -90 度，这里需要调整坐标轴
    position.value = [
      x * 0.001 - alignPosition.x,
      z * 0.001 - alignPosition.y,
      -y * 0.001 - alignPosition.z,
    ];
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
    <Align v-if="mesh" @change="onAlignChange">
      <primitive
        :object="mesh"
        :scale="0.001"
        dispose
        :rotation-x="-Math.PI / 2"
        @click="onClick"
      />
    </Align>
    <TresMesh ref="mark" :position="position" :scale="0.001">
      <TresBoxGeometry />
      <TresMeshBasicMaterial color="red" />
      <TresAxesHelper :args="[10]" />
    </TresMesh>
  </TresGroup>
</template>

<style scoped></style>
