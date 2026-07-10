<script setup lang="ts">
import {extend} from "@tresjs/core";
import fragmentShader from "../shaders/fragment.glsl?raw";
import vertexShader from "../shaders/vertex.glsl?raw";
import * as THREE from "three";

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
          value: 2.0,
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

    this.onBeforeRender = () => {
      const uTime = this.uniforms.uTime;
      if (uTime) {
        uTime.value = performance.now() * 0.001;
      }
    };
  }
}
extend({ShieldMaterial});
</script>

<template>
  <TresMesh cast-shadow receive-shadow>
    <TresSphereGeometry :args="[1.8, 64, 64]" />
    <TresShieldMaterial />
  </TresMesh>
</template>

<style scoped></style>
