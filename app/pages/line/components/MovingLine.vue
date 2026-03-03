<script setup lang="ts" async>
import {Align, Line2} from "@tresjs/cientos";
import {CatmullRomCurve3, Vector3} from "three";

const props = defineProps<{
  data: {x: string; y: string; z: string}[];
}>();

const points = props.data.map((p) => new Vector3(+p.x, +p.y, +p.z));

const curve = new CatmullRomCurve3(points);
const linePoints = curve.getPoints(props.data.length * 10);

const positions = linePoints.flatMap((p) => [p.x, p.y, p.z]);

const arrowRef = shallowRef();
const {onRender} = useLoop();

const dashOffset = ref(0);

onRender(({elapsed, delta}) => {
  dashOffset.value -= delta * 100;
  if (arrowRef.value) {
    const t = (elapsed * 0.1) % 1;
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
      :points="points"
      color="orange"
      :line-width="5"
      dashed
      :gap-size="1"
      :dash-offset="dashOffset"
    />
    <TresGroup ref="arrowRef">
      <TresMesh :rotation="[Math.PI / 2, 0, 0]" :scale="5">
        <TresConeGeometry :args="[0.1, 0.4, 4]" />
        <TresMeshBasicMaterial color="white" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
