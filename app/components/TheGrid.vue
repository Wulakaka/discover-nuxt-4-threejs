<script setup lang="ts">
import * as THREE from "three/webgpu";
import {
  abs,
  color,
  fwidth,
  float,
  positionLocal,
  smoothstep,
  uv,
  uniform,
  Fn,
  mix,
} from "three/tsl";

interface Props {
  sectionColor?: THREE.Color | string;
  cellColor?: THREE.Color | string;
}

const props = withDefaults(defineProps<Props>(), {
  sectionColor: "#fbb03b",
  cellColor: "#82dbc5",
});

const uSectionColor = uniform(new THREE.Color(props.sectionColor));

const uCellColor = uniform(new THREE.Color(props.cellColor));

const getGrid = Fn(
  ({cellCount, lineWidth}: {cellCount: number; lineWidth: number}) => {
    const cellX = uv().x.mul(cellCount);
    const distToCenterX = abs(cellX.fract().sub(0.5));
    const cellY = uv().y.mul(cellCount);
    const distToCenterY = abs(cellY.fract().sub(0.5));

    // 转换 UV 距离为像素距离，以便宽度在屏幕空间中保持不变。
    // fwidth() 返回一个值，表示当前片段在屏幕空间中相对于其邻居的变化率。通过将距离除以 fwidth，我们可以获得一个近似的像素距离。
    // 当平面因透视、缩放或距离变化导致 UV 在屏幕上的密度改变时，fwidth(cellX) 也会同步变化
    const distPx1 = distToCenterX.div(fwidth(cellX));
    const distPx2 = distToCenterY.div(fwidth(cellY));
    const distPx = distPx1.min(distPx2);

    // 半线宽
    const halfWidthPx = float(lineWidth).mul(0.5);
    // 创建一像素的平滑边缘，以避免锯齿。smoothstep() 在给定的边界范围内创建一个平滑的过渡。
    const aa = float(0.5);
    const lineMask = smoothstep(
      halfWidthPx.sub(aa),
      halfWidthPx.add(aa),
      distPx,
    ).oneMinus();
    return lineMask;
  },
);

const circle = uv().sub(0.5).length().mul(2.0).pow(4.0).oneMinus();

const gridSection = getGrid({cellCount: 20, lineWidth: 1.3});

const gridCell = getGrid({cellCount: 60, lineWidth: 0.8});

const colorSection = color(uSectionColor).mul(gridSection);

const colorCell = color(uCellColor).mul(gridCell).mul(0.25);

const outColor = mix(colorCell, colorSection, colorSection.step(0.001));

const gridMaterial = new THREE.MeshStandardNodeMaterial({
  colorNode: outColor.toneMapping(THREE.ACESFilmicToneMapping),
  opacityNode: circle.mul(gridSection.add(gridCell).clamp(0.0, 1.0)),
  positionNode: positionLocal,
  transparent: true,
  side: 2, // double-sided
});

onBeforeUnmount(() => {
  gridMaterial.dispose();
});
</script>

<template>
  <TresMesh
    :material="gridMaterial"
    :rotation-x="-Math.PI / 2"
    :frustum-culled="false"
  >
    <TresPlaneGeometry :args="[10, 10, 1, 1]" />
  </TresMesh>
</template>

<style scoped></style>
