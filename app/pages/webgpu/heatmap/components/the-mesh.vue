<script setup lang="ts">
import {
  color,
  Fn,
  mix,
  positionLocal,
  texture,
  transformNormalToView,
  uv,
  vec2,
} from "three/tsl";
import * as THREE from "three/webgpu";

import response from "../data.json";

export interface SceneHeatMapData {
  data: ([number, number, number] | null)[];
  /**
   * x方向点个数
   */
  pointCountX: number;
  /**
   * y方向点个数
   */
  pointCountY: number;
  heatMapMaxHeight?: number;
  heatMapMinHeight?: number;
  heatMapThresholdHeight?: number;
  originX?: number;
  originY?: number;
  originZ?: number;
  collapseCode?: string;
}

const {
  data: [{pointCountX, pointCountY, data}],
} = response as {
  data: [SceneHeatMapData];
};

const textureArray = new Float32Array(pointCountX * pointCountY * 4);
for (let i = 0; i < pointCountX * pointCountY; i++) {
  const i4 = i * 4;
  textureArray[i4 + 0] = (i % pointCountX) - pointCountX / 2;
  textureArray[i4 + 1] = data[i]?.[0] ?? 0;
  textureArray[i4 + 2] = Math.floor(i / pointCountX) - pointCountY / 2;
  textureArray[i4 + 3] = 1;
}

// data.forEach((item, index) => {
//   const y = item?.[0] ?? 0;
//   const x = (index % pointCountX) * 1 - pointCountX / 2;
//   const z = Math.floor(index / pointCountX) * 1 - pointCountY / 2;

//   textureArray.set([x, y, z, 1], index * 4);
// });

const dataTexture = new THREE.DataTexture(
  textureArray,
  pointCountX,
  pointCountY,
  THREE.RGBAFormat,
  THREE.FloatType,
);

dataTexture.needsUpdate = true;

const geometry = new THREE.PlaneGeometry(
  pointCountX,
  pointCountY,
  pointCountX,
  pointCountY,
);

geometry.rotateX(-Math.PI / 2);

const material = new THREE.MeshStandardNodeMaterial({
  // wireframe: true,
  // side: THREE.DoubleSide,
});

material.colorNode = Fn(() => {
  const y = texture(dataTexture, uv()).g;
  const strength = y.div(10).clamp();
  return mix(color("red"), color("white"), strength);
})();

material.positionNode = Fn(() => {
  const y = texture(dataTexture, uv()).g;

  positionLocal.y.assign(y);

  return positionLocal;
})();

material.normalNode = Fn(() => {
  const p = texture(dataTexture, uv());
  const leftUv = vec2(uv().x.add(1 / pointCountX), uv().y);
  const pLeft = texture(dataTexture, leftUv);
  const topUv = vec2(uv().x, uv().y.add(1 / pointCountY));
  const pTop = texture(dataTexture, topUv);
  const toLeft = pLeft.sub(p).normalize();
  const toTop = pTop.sub(p).normalize();
  const newNormal = toTop.cross(toLeft);
  return transformNormalToView(newNormal);
})();
</script>

<template>
  <TresGroup>
    <TresMesh :geometry :material cast-shadow receive-shadow />
  </TresGroup>
</template>

<style scoped></style>
