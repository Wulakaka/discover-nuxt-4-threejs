import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import {instancedArray, instanceIndex, texture, vec2} from "three/tsl";
import {
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteNodeMaterial,
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

    const size = 32;
    const count = Math.pow(size, 2);

    const positionBuffer = instancedArray(count, "vec3");

    const colorBuffer = instancedArray(count, "vec4");

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
    })().compute(count);

    /**
     * Material
     */
    const material = new SpriteNodeMaterial({
      positionNode: positionBuffer.toAttribute(),
      colorNode: colorBuffer.toAttribute(),
    });

    const sprite = new Sprite(material);
    sprite.count = count;

    scene.add(sprite);

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

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
      // renderer.compute(initCompute);
      renderer.render(scene, camera);
    }

    function dispose() {
      material.dispose();
      controls.dispose();
      renderer.dispose();
    }

    return dispose;
  }
}
