<script setup lang="ts">
import {Line2} from "@tresjs/cientos";
import {CatmullRomCurve3, Vector3} from "three";
import pointList from "@/assets/json/points.json";

const points = pointList.map((p) => new Vector3(p.x, p.y, p.z));
const curve = new CatmullRomCurve3(points);
const linePoints = curve.getPoints(pointList.length * 10);

const positions = linePoints.flatMap((p) => [p.x, p.y, p.z]);

const arrowRef = shallowRef();
const {onRender} = useLoop();

const dashOffset = ref(0);

onRender(({elapsed, delta}) => {
  dashOffset.value -= delta * 10;
  if (arrowRef.value) {
    const t = (elapsed * 0.01) % 1;
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    arrowRef.value.position.copy(position);
    arrowRef.value.lookAt(position.clone().add(tangent));
  }
});
</script>

<template>
  <TresGroup>
    <Line2
      :points="positions"
      color="orange"
      :line-width="5"
      dashed
      :gap-size="0.2"
      :dash-offset="dashOffset"
    />
    <TresGroup ref="arrowRef">
      <TresMesh :rotation="[0, 0, Math.PI / 2]">
        <TresConeGeometry :args="[0.1, 0.4, 4]" />
        <TresMeshBasicMaterial color="white" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
