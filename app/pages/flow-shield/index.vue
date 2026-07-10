<script setup lang="ts">
import {extend, TresCanvas} from "@tresjs/core";
import {OrbitControls} from "@tresjs/cientos";
import * as THREE from "three";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

class ShieldMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: {value: 0},
        uColor: {
          value: new THREE.Color("#26aeff"),
        },
        uFresnelPower: {
          value: 2.0,
        },
        uFresnelStrength: {
          value: 0.5,
        },
      },
      vertexShader,
      fragmentShader,
      // Allows alpha blending so we can see objects inside the shield
      transparent: true,
      // Prevents the transparent shield from being depth blocking
      depthWrite: false,
      // Adds the shield color on top of the scene for a brighter glow
      blending: THREE.AdditiveBlending,
    });
  }
}
extend({ShieldMaterial});
</script>

<template>
  <TresCanvas shadows window-size>
    <TresPerspectiveCamera :position="[8, 5, 8]" :fov="50" />
    <OrbitControls />
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 3]" :intensity="1.5" cast-shadow />
    <TresMesh cast-shadow receive-shadow>
      <TresSphereGeometry :args="[1.8, 64, 64]" />
      <TresShieldMaterial />
    </TresMesh>
  </TresCanvas>
</template>

<style scoped></style>
