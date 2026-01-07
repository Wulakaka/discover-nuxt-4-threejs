import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import type {float} from "three/tsl";
import {
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
  uniform,
  abs,
} from "three/tsl";

import {
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  WebGPURenderer,
} from "three/webgpu";

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
    const size = 40;
    const count = Math.pow(size, 2);

    const uActiveTime = uniformArray(Array(count).fill(0), "float");

    const uTime = uniform(performance.now() * 0.001, "float");

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
      progress.assign(1);
    })().compute(count);

    const updateCompute = Fn(() => {
      // position
      // const pos = positionBuffer.element(instanceIndex);

      const col = instanceIndex.mod(size).toFloat();
      const row = instanceIndex.div(size).toFloat();
      const newUv = vec2(col.div(size - 1), row.div(size - 1));
      // color
      const color = colorBuffer.element(instanceIndex);
      color.assign(texture(image, newUv));

      // progress
      const progress = progressBuffer.element(instanceIndex);

      Loop(count, ({i}) => {
        const activeTime = uActiveTime.element(i);
        If(activeTime.greaterThan(0), () => {
          const activeUv = vec2(
            i
              .mod(size)
              .toFloat()
              .div(size - 1),
            i
              .div(size)
              .toFloat()
              .div(size - 1)
          );
          const dist = distance(newUv, activeUv);
          const velocity = 0.5;
          const waveDist = uTime.sub(activeTime).mul(velocity);

          If(abs(waveDist.sub(dist)).lessThan(0.1), () => {
            progress.subAssign(1);
          });
        });
      });

      progress.assign(progress.add(deltaTime.mul(0.2)).clamp(0, 1));
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
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const index = y * size + x;
      console.log(` ${y} 行 ${x} 列`, index);
      uActiveTime.array[index] = performance.now() * 0.001;
    };
    window.addEventListener("click", clickHandler);

    /**
     * Camera
     */
    // Base camera
    const camera = new PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      1000
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

      uTime.value = performance.now() * 0.001;

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
