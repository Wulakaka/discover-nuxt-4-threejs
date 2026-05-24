<script setup lang="ts">
import {
  Fn,
  positionLocal,
  texture,
  vec3,
  vec2,
  uv,
  float,
  normalLocal,
  transformNormalToView,
  vec4,
} from "three/tsl";
import * as THREE from "three/webgpu";

const size = 8;

const {node} = (() => {
  const textureData = new Float32Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const i4 = i * 4;
    textureData[i4] = Math.random();
  }
  const textureHeight = new THREE.DataTexture(
    textureData,
    size,
    size,
    THREE.RGBAFormat,
  );

  // 延伸而不是重复
  textureHeight.wrapS = THREE.ClampToEdgeWrapping;
  textureHeight.wrapT = THREE.ClampToEdgeWrapping;

  textureHeight.needsUpdate = true;

  // useIntervalFn(() => {
  //   for (let i = 0; i < textureData.length; i++) {
  //     textureData[i] = Math.random();
  //   }
  //   textureHeight.needsUpdate = true;
  // }, 1000);

  const positionNode = Fn(() => {
    const s = float(size);
    const uv = vec2(positionLocal.xz).div(s).add(0.5);
    const h = texture(textureHeight, uv).r;
    return positionLocal.y
      .greaterThan(0)
      .select(positionLocal.add(vec3(0, h, 0)), positionLocal);
  });

  const delta = 1 / size;
  const normalNode = Fn(() => {
    const s = float(size);
    const d = float(delta);
    const uv = vec2(positionLocal.xz).div(s).add(0.5);
    const h = texture(textureHeight, uv).r;
    const hL = texture(textureHeight, uv.add(vec2(d.negate(), 0))).r;
    const hR = texture(textureHeight, uv.add(vec2(d, 0))).r;
    const hD = texture(textureHeight, uv.add(vec2(0, d.negate()))).r;
    const hU = texture(textureHeight, uv.add(vec2(0, d))).r;
    const n = vec3(d.mul(2), hR.sub(h), 0)
      .cross(vec3(0, hU.sub(h), d.mul(2)))
      .negate()
      .normalize();
    return positionLocal.y
      .greaterThan(s.div(2))
      .select(transformNormalToView(n), transformNormalToView(normalLocal));
  });

  const colorNode = vec4(texture(textureHeight, uv()).r);
  return {
    node: {
      positionNode,
      normalNode,
      colorNode,
    },
  };
})();

const material = new THREE.MeshStandardNodeMaterial({
  color: "hotpink",
  positionNode: node.positionNode(),
  normalNode: node.normalNode(),
  wireframe: true,
});

const planeMaterial = new THREE.MeshBasicNodeMaterial({
  colorNode: node.colorNode,
  side: THREE.DoubleSide,
});
</script>

<template>
  <TresGroup>
    <TresMesh :material="material" :scale="2 / size">
      <TresBoxGeometry :args="[size, size, size, size, 1, size]" />
    </TresMesh>
    <TresMesh
      :position-x="2"
      :material="planeMaterial"
      :rotation-x="Math.PI / 2"
    >
      <TresPlaneGeometry :args="[1, 1]" />
    </TresMesh>
  </TresGroup>
</template>

<style scoped></style>
