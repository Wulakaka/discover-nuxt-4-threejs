import {GLTFLoader, OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";

import {
  vec2,
  screenUV,
  color,
  Fn,
  storage,
  instanceIndex,
  uniform,
  vec4,
  If,
  objectWorldMatrix,
  attribute,
  instancedArray,
} from "three/tsl";

import type {BufferAttribute, Mesh} from "three/webgpu";
import {
  MeshNormalNodeMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  StorageBufferAttribute,
  Vector2,
  Vector4,
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
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    // uniforms
    const pointerPosition = uniform(vec4(0));

    const elasticity = uniform(0.04);
    const damping = uniform(0.94);
    const brushSize = uniform(0.25);
    const brushStrength = uniform(0.22);

    // Loaders
    const gltfLoader = new GLTFLoader();

    // Scene
    const scene = new Scene();
    const bgColor = screenUV.y.mix(color(0x9f87f7), color(0xf2cdcd));
    // 虚光照
    const bgVignette = screenUV
      .distance(vec2(0.5))
      .remapClamp(0.3, 0.8)
      .oneMinus();
    const bgIntensity = 4;

    scene.backgroundNode = bgColor.mul(
      bgVignette.mul(color(0xa78ff6).mul(bgIntensity))
    );

    /**
     * Material
     */

    const jelly = Fn(({geometry, object}) => {
      // 因为要在加载之后才能获取到 geometry 的信息
      // 所以要在这里创建 storage buffer attribute
      const count = geometry.attributes.position!.count;

      const positionBaseAttribute = geometry.attributes
        .position as BufferAttribute;

      const positionStorageBufferAttribute = new StorageBufferAttribute(
        positionBaseAttribute.array,
        3
      );

      geometry.setAttribute("storagePosition", positionStorageBufferAttribute);

      // Attributes
      // 转换为 storageBufferNode
      const positionAttribute = storage(positionBaseAttribute, "vec3", count);
      const positionStorageAttribute = storage(
        positionStorageBufferAttribute,
        "vec3",
        count
      );
      const speedAttribute = instancedArray(count, "vec3");

      // Vectors
      const basePosition = positionAttribute.element(instanceIndex);
      const currentPosition = positionStorageAttribute.element(instanceIndex);
      const currentSpeed = speedAttribute.element(instanceIndex);

      const computeUpdate = Fn(() => {
        // pinch
        // 捏取效果
        If(pointerPosition.w.equal(1), () => {
          const worldPosition = objectWorldMatrix(object).mul(currentPosition);

          const dist = worldPosition.distance(pointerPosition.xyz);
          const direction = pointerPosition.xyz.sub(worldPosition).normalize();

          const power = brushSize.sub(dist).max(0).mul(brushStrength);

          // 为什么这里不是施加力，而是直接改变位置？
          // 因为力是用来模拟弹性的，而捏取效果更像是直接改变位置
          currentPosition.addAssign(direction.mul(power));
        });

        const force = elasticity.mul(basePosition.sub(currentPosition));

        currentSpeed.addAssign(force);

        currentSpeed.mulAssign(damping);

        currentPosition.addAssign(currentSpeed);
      })().compute(count);

      return computeUpdate;
    });

    const material = new MeshNormalNodeMaterial({
      geometryNode: jelly(),
      positionNode: attribute("storagePosition"),
    });

    gltfLoader
      .loadAsync("/models/gltf/LeePerrySmith/LeePerrySmith.glb")
      .then((gltf) => {
        const mesh = gltf.scene.children[0] as Mesh;
        mesh.scale.setScalar(0.1);

        mesh.material = material;
        scene.add(mesh);
      });

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
    window.addEventListener("pointermove", onPointerMove);

    /**
     * Camera
     */
    // Base camera
    const camera = new PerspectiveCamera(
      35,
      sizes.width / sizes.height,
      0.1,
      10
    );

    camera.position.set(0, 0, 1);
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.minDistance = 0.7;
    controls.maxDistance = 2;

    /**
     * Renderer
     */
    const renderer = new WebGPURenderer({
      canvas: canvas,
      antialias: true,
    });

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.inspector = new Inspector();

    // await renderer.init();

    renderer.setAnimationLoop(animate);

    const gui = (<Inspector>renderer.inspector).createParameters("Settings");
    gui.add(elasticity, "value", 0, 0.5).name("elasticity");
    gui.add(damping, "value", 0.9, 0.98).name("damping");
    gui.add(brushSize, "value", 0.1, 0.5).name("brush size");
    gui.add(brushStrength, "value", 0.1, 0.3).name("brush strength");

    function onPointerMove(event: MouseEvent) {
      // calculate pointer position in normalized device coordinates
      // (-1 to +1) for both components
      pointer.x = (event.clientX / sizes.width) * 2 - 1;
      pointer.y = -(event.clientY / sizes.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // 可能存在多个交点
      const intersects = raycaster.intersectObject(scene);
      if (intersects.length > 0) {
        const intersect = intersects[0]!;
        pointerPosition.value.copy(new Vector4(...intersect.point, 0));
        pointerPosition.value.w = 1;
      } else {
        pointerPosition.value.w = 0;
      }
    }

    /**
     * Animate
     */
    function animate() {
      // Update controls
      controls.update();

      // Render

      renderer.render(scene, camera);
    }

    function dispose() {
      controls.dispose();
      renderer.dispose();
      material.dispose();

      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("pointermove", onPointerMove);
    }

    return dispose;
  }
}
