import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";

import {
  If,
  deltaTime,
  instancedArray,
  instanceIndex,
  positionLocal,
  texture,
  vec2,
  uniform,
  mx_noise_vec3,
  mx_noise_float,
  float,
  Fn,
} from "three/tsl";

import {
  BoxGeometry,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  WebGPURenderer,
} from "three/webgpu";

export function useExperience(ref: Ref<HTMLCanvasElement | null>) {
  let disposeFn: (() => void) | null = null;
  whenever(
    ref,
    async (canvas) => {
      disposeFn = await init(canvas);
    },
    {immediate: true, once: true}
  );

  onBeforeUnmount(() => {
    disposeFn?.();
  });

  async function init(canvas: HTMLCanvasElement) {
    const textureLoader = new TextureLoader();
    const image = textureLoader.load("/image.jpg");
    const image2 = textureLoader.load("/image2.jpeg");

    // Scene
    const scene = new Scene();

    const meshSize = 30;

    // TSL
    const size = 200;
    const count = Math.pow(size, 2);

    const positionBuffer = instancedArray(count, "vec3");

    const basePositionBuffer = instancedArray(count, "vec3");

    const colorBuffer = instancedArray(count, "vec4");

    // 线性变化
    const progressBuffer = instancedArray(count, "float");

    const randomArray = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randomArray[i] = Math.random();
    }
    const randomBuffer = instancedArray(randomArray, "float");

    const threshold = uniform(0.44, "float");

    const offset = uniform(0.08, "float");

    const fadeDuration = uniform(2, "float");

    const progressDamping = uniform(0.01, "float");

    const resetCompute = Fn(() => {
      const progress = progressBuffer.element(instanceIndex);
      const basePos = basePositionBuffer.element(instanceIndex);
      const pos = positionBuffer.element(instanceIndex);

      pos.assign(basePos);

      progress.assign(
        mx_noise_float(pos.xyz.mul(0.01)).remap(-1, 1, 0, threshold).add(offset)
      );
    })().compute(count);

    const initCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);
      const basePos = basePositionBuffer.element(instanceIndex);
      // instanceIndex 的类型是 uint, 需要转换为 float 或者 int 才能进行数学运算
      const col = instanceIndex.mod(size).toFloat();
      const row = instanceIndex.div(size).toFloat();
      basePos.x.assign(col.sub(size / 2).add(0.5));
      basePos.y.assign(row.sub(size / 2).add(0.5));
      basePos.z.assign(0);

      pos.assign(basePos.xyz);
      const newUv = vec2(col, row).add(0.5).div(size);

      // color
      const color = colorBuffer.element(instanceIndex);
      color.assign(texture(image, newUv));
    })().compute(count);

    const updateCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);
      const random = randomBuffer.element(instanceIndex);

      // progress
      const progress = progressBuffer.element(instanceIndex);

      If(progress.lessThan(1), () => {
        progress.addAssign(deltaTime.mul(progressDamping));

        If(progress.greaterThanEqual(threshold), () => {
          pos.addAssign(mx_noise_vec3(pos.xyz.mul(0.01), 1).mul(random));
        });
      });
    })().compute(count);

    /**
     * Material
     */

    const aPosition = positionBuffer.toAttribute();
    const aProgress = progressBuffer.toAttribute();
    const aRandom = randomBuffer.toAttribute();

    const material = new MeshBasicNodeMaterial({
      positionNode: aPosition.add(
        positionLocal.mul(
          aProgress
            .remap(
              threshold,
              threshold.add(
                fadeDuration
                  .mul(progressDamping)
                  .mul(float(0.1).add(aRandom.mul(0.9)))
              ),
              1,
              0
            )
            .clamp(0, 1)
        )
      ), // 必须叠加 positionLocal
      colorNode: colorBuffer.toAttribute(),
      side: 2,
      transparent: true,
    });

    const geometry = new BoxGeometry();

    const mesh = new Mesh(geometry, material);
    mesh.count = count;
    mesh.scale.setScalar(meshSize / size);
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
    const reset = () => {
      // renderer.compute(initCompute);
      renderer.compute(resetCompute);
    };

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

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.inspector = new Inspector();

    await renderer.init();
    // 需要在 setAnimationLoop 之前调用 compute 初始化数据，否则图像会不显示
    renderer.compute(initCompute);
    renderer.compute(resetCompute);
    renderer.setAnimationLoop(animate);

    const gui = (<Inspector>renderer.inspector).createParameters("Parameters");

    gui.add(threshold, "value", 0.01, 1, 0.01).name("Threshold");
    gui.add(offset, "value", 0, 1, 0.01).name("Offset");
    gui
      .add(progressDamping, "value", 0.001, 0.1, 0.001)
      .name("Progress Damping");

    gui.add(fadeDuration, "value", 0.1, 5, 0.1).name("Fade Duration");

    gui.add({fn: reset}, "fn").name("Reset");

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
    }

    return dispose;
  }
}
