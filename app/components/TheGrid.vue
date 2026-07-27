<script setup lang="ts">
import {MeshBasicNodeMaterial} from "three/webgpu";
import * as THREE from "three/webgpu";
import {
  abs,
  color,
  fwidth,
  float,
  positionLocal,
  smoothstep,
  uv,
  vec4,
  uniform,
  Fn,
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
    // 10 cells along U, one line at each cell center => exactly 10 lines.
    const cellX = uv().x.mul(cellCount);
    const distToCenterX = abs(cellX.fract().sub(0.5));
    const cellY = uv().y.mul(cellCount);
    const distToCenterY = abs(cellY.fract().sub(0.5));

    // Convert UV distance to pixel distance so width stays constant in screen space.
    const distPx1 = distToCenterX.div(fwidth(cellX));
    const distPx2 = distToCenterY.div(fwidth(cellY));
    const distPx = distPx1.min(distPx2);

    const halfWidthPx = float(lineWidth).mul(0.5); // 2px total width
    const aa = float(0.5); // anti-alias transition in pixels
    const lineMask = float(1.0).sub(
      smoothstep(halfWidthPx.sub(aa), halfWidthPx.add(aa), distPx),
    );
    return lineMask.step(0.5);
  },
);

const circle = uv().sub(0.5).length().mul(2.0).pow(4.0).oneMinus();

const grid1 = getGrid({cellCount: 20, lineWidth: 1.3});

const grid2 = getGrid({cellCount: 60, lineWidth: 0.8});

const line1Color = color(uSectionColor);

const line2Color = color(uCellColor);

const color1 = line1Color.mul(grid1);
const color2 = line2Color.mul(grid2);

const outColor = vec4(color1.max(color2), circle);

const gridMaterial = new MeshBasicNodeMaterial({
  colorNode: outColor,
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
