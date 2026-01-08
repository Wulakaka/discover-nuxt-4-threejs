import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import type {float} from "three/tsl";
import {
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
  sin,
  length,
  abs,
  luminance,
  saturate,
  vec4,
  cos,
  PI2,
  mix,
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

    // Scene
    const scene = new Scene();

    const meshSize = 30;

    const maxPoints = 50;

    // TSL
    const size = 100;
    const count = Math.pow(size, 2);

    const activeList: Vector2[] = Array(maxPoints)
      .fill(null)
      .map(() => new Vector2(count + 1, 0));
    let fillIndex = -1;
    const uActiveList = uniformArray(activeList, "vec2");

    const uActiveListLength = uniform(uActiveList.array.length, "uint");

    const uTime = uniform(performance.now() * 0.001, "float");

    const positionBuffer = instancedArray(count, "vec3");

    const rotationBuffer = instancedArray(count, "vec3");

    const colorBuffer = instancedArray(count, "vec4");

    const progressBuffer = instancedArray(count, "float");

    const velocity = uniform(30, "float");

    const amplitude = uniform(10, "float");

    const progressDamping = uniform(0.2, "float");

    const initCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);
      // instanceIndex 的类型是 uint, 需要转换为 float 或者 int 才能进行数学运算
      const col = instanceIndex.mod(size).toFloat();
      const row = instanceIndex.div(size).toFloat();
      pos.x.assign(col.sub(size / 2).add(0.5));
      pos.y.assign(row.sub(size / 2).add(0.5));
      const newUv = vec2(col, row).add(0.5).div(size);

      // rotation
      const rot = rotationBuffer.element(instanceIndex);
      rot.assign(vec3(0, 0, 0));

      // color
      const color = colorBuffer.element(instanceIndex);
      color.assign(texture(image, newUv));

      // progress
      const progress = progressBuffer.element(instanceIndex);
      progress.assign(1);
    })().compute(count);

    const updateCompute = Fn(() => {
      // position
      const pos = positionBuffer.element(instanceIndex);

      // rotation
      // const rot = rotationBuffer.element(instanceIndex);
      // const baseRotation = vec3(0, 0, 0);

      const col = instanceIndex.mod(size);
      const row = instanceIndex.div(size);
      const newUv = vec2(col.toFloat(), row.toFloat()).add(0.5).div(size);

      // color
      const color = colorBuffer.element(instanceIndex);

      // progress
      const progress = progressBuffer.element(instanceIndex);

      progress.assign(progress.add(deltaTime.mul(progressDamping)).clamp(0, 1));

      Loop(uActiveListLength, ({i}) => {
        const activeItem = uActiveList.element(i);

        const activeIndex = activeItem.x.toUint();
        const activeTime = activeItem.y;

        const elapsedTime = uTime.sub(activeTime);

        If(activeIndex.lessThan(count), () => {
          const activeUv = vec2(
            activeIndex.mod(size).toFloat(),
            activeIndex.div(size).toFloat()
          )
            .add(0.5)
            .div(size);

          const dist = length(newUv.sub(activeUv).mul(size));

          const waveDist = elapsedTime.mul(velocity);

          const diff = waveDist.sub(dist);
          If(abs(diff).lessThan(1), () => {
            progress.subAssign(1.0);
          });

          // const toPoint = activeUv.sub(newUv);

          // If(toPoint.length().greaterThan(0.0), () => {
          //   const toPointDir = toPoint.normalize();
          //   baseRotation.addAssign(vec3(toPointDir.xy, 0));
          // });
        });
      });

      progress.clampAssign(0, 1);

      // 更新
      const posProgress = progress.remap(0, 0.1).clamp(0, 1);
      pos.z.assign(sin(posProgress.mul(PI)).mul(amplitude));

      const originalColor = texture(image, newUv);
      const colorL = luminance(originalColor.xyz);
      const strength = cos(progress.mul(PI2)).add(1).mul(0.5).oneMinus();

      // 3个通道值保持一致就会出现灰度效果
      color.assign(mix(vec4(vec3(colorL), 1), originalColor, strength));

      // If(baseRotation.length().equal(0.0), () => {
      //   baseRotation.assign(vec3(0, 1, 0));
      // });

      // rot.assign(rotate(baseRotation.normalize(), vec3(0, 0, 0)));
    })().compute(count);

    /**
     * Material
     */
    const posLocal = Fn(
      ([progress, rotation]: [
        ReturnType<typeof float>,
        ReturnType<typeof vec3>
      ]) => {
        const p = positionLocal.toVar();
        // p.assign(rotate(positionLocal, vec3(0, progress.mul(PI), 0)));
        // p.assign(rotate(p, vec3(1, 1, 1).mul(PI).mul(progress)));
        // 这里要用 addAssign，因为 positionLocal 已经包含了初始位置
        // p.z.addAssign(sin(progress.mul(PI)).mul(4.0));

        return p;
      }
    );

    const aPosition = positionBuffer.toAttribute();
    const progress = progressBuffer.toAttribute();
    const rotation = rotationBuffer.toAttribute();

    const material = new MeshBasicNodeMaterial({
      positionNode: aPosition.add(positionLocal), // 必须叠加 positionLocal
      colorNode: colorBuffer.toAttribute(),
      side: 2,
      transparent: true,
    });

    const geometry = new PlaneGeometry(1, 1);

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
    const clickHandler = () => {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const index = y * size + x;

      fillIndex = ++fillIndex % maxPoints;
      console.log(` ${y} 行 ${x} 列`, fillIndex);
      uActiveList.array[fillIndex] = new Vector2(
        index,
        performance.now() * 0.001
      );
      // uActiveList.array[fillIndex] = new Vector2(
      //   count - 1,
      //   performance.now() * 0.001
      // );
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

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.inspector = new Inspector();

    await renderer.init();
    // 需要在 setAnimationLoop 之前调用 compute 初始化数据，否则图像会不显示
    renderer.compute(initCompute);
    renderer.setAnimationLoop(animate);

    const gui = (<Inspector>renderer.inspector).createParameters("Parameters");

    gui.add(velocity, "value", 0.01, 100, 0.1).name("Wave Velocity");
    gui.add(amplitude, "value", 0.1, 40, 0.1).name("Wave Amplitude");
    gui.add(progressDamping, "value", 0.01, 1, 0.01).name("Progress Damping");

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
