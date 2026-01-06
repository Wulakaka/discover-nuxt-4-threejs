import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import type {float} from "three/tsl";
import {
  abs,
  distance,
  If,
  deltaTime,
  instancedArray,
  instanceIndex,
  Loop,
  PI,
  positionLocal,
  rotate,
  texture,
  uniformArray,
  vec2,
  vec3,
} from "three/tsl";

import {
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector2,
  WebGPURenderer,
} from "three/webgpu";
import gsap from "gsap";

export function useExperience(ref: Ref<HTMLCanvasElement | null>) {
  let disposeFn: (() => void) | null = null;
  whenever(ref, async (canvas) => {
    disposeFn = await init(canvas);
  });

  onBeforeUnmount(() => {
    disposeFn?.();
  });

  async function init(canvas: HTMLCanvasElement) {
    const textureLoader = new TextureLoader();
    const image = textureLoader.load("/image2.jpeg");

    // Scene
    const scene = new Scene();

    // TSL
    const size = 4;
    const count = Math.pow(size, 2);

    const points: Vector2[] = [];
    const uPoints = uniformArray([new Vector2(0.5, 0.5)], "vec2");

    const positionBuffer = instancedArray(count, "vec3");

    const colorBuffer = instancedArray(count, "vec4");

    const progressBuffer = instancedArray(count, "float");

    const initCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);
      // instanceIndex 的类型是 uint, 需要转换为 float 或者 int 才能进行数学运算
      const col = instanceIndex.mod(size).toFloat();
      const row = instanceIndex.div(size).toFloat();
      pos.x.assign(col.sub(size / 2).add(0.5));
      pos.y.assign(row.sub(size / 2).add(0.5));
      const newUv = vec2(col.div(size - 1), row.div(size - 1));
      // const distance = newUv.length();
      // pos.z.assign(sin(distance.add(time).mul(5)));

      // color
      const color = colorBuffer.element(instanceIndex);
      color.assign(texture(image, newUv));

      // progress
      const progress = progressBuffer.element(instanceIndex);
      progress.assign(0);
    })().compute(count);

    const updateCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);

      const col = instanceIndex.mod(size).toFloat();
      const row = instanceIndex.div(size).toFloat();
      const newUv = vec2(col.div(size - 1), row.div(size - 1));
      // color
      const color = colorBuffer.element(instanceIndex);
      color.assign(texture(image, newUv));

      // progress
      const progress = progressBuffer.element(instanceIndex);
      progress.assign(progress.add(deltaTime.mul(0.1)).min(1));

      // const strength = float(0);

      // const l = uPoints.length();

      Loop(1, ({i}) => {
        const point = uPoints.element(i);
        const dist = distance(pos.xy, point);
        If(abs(dist.sub(deltaTime)).lessThan(0.1), () => {
          progress.assign(0);
        });
      });
    })().compute(count);

    /**
     * Material
     */
    const posLocal = Fn(([progress]: [ReturnType<typeof float>]) => {
      const p = rotate(positionLocal, vec3(0, progress.mul(PI), 0));

      return p;
    });

    const progress = progressBuffer.toAttribute();

    const material = new MeshBasicNodeMaterial({
      positionNode: positionBuffer.toAttribute().add(posLocal(progress)), // 必须叠加 positionLocal
      colorNode: colorBuffer.toAttribute(),
      side: 2,
    });

    const geometry = new PlaneGeometry(1, 1);

    const mesh = new Mesh(geometry, material);
    mesh.count = count;
    // mesh.frustumCulled = false;

    scene.add(mesh);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const resizeHandler = () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", resizeHandler);

    /**
     * Click
     */
    const clickHandler = () => {
      points.push(new Vector2(Math.random(), Math.random()));
      const progress = {
        value: 0,
      };
      gsap.to(progress, {
        value: 1,
        duration: 5,
        onComplete: () => {
          points.pop();
        },
      });
    };
    window.addEventListener("click", clickHandler);

    /**
     * Camera
     */
    // Base camera
    const camera = new PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      1,
      100
    );

    camera.position.set(0, 0, 60);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    /**
     * Renderer
     */
    const renderer = new WebGPURenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });

    await renderer.init();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.inspector = new Inspector();
    renderer.setClearColor(0x202020, 1);

    renderer.setAnimationLoop(animate);

    renderer.compute(initCompute);

    /**
     * Animate
     */
    function animate() {
      // Update controls
      controls.update();

      // Render
      renderer.compute(updateCompute);
      renderer.render(scene, camera);
    }

    function dispose() {
      geometry.dispose();
      material.dispose();
      controls.dispose();
      renderer.dispose();

      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("click", clickHandler);
    }

    return dispose;
  }
}
