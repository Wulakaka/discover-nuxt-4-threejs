import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import {float, instancedArray, instanceIndex} from "three/tsl";
import {
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteNodeMaterial,
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
    // Scene
    const scene = new Scene();

    const size = 4;
    const count = Math.pow(size, 2);

    const positionBuffer = instancedArray(count, "vec3");

    const initCompute = Fn(() => {
      const pos = positionBuffer.element(instanceIndex);
      const col = instanceIndex.mod(size);
      const row = instanceIndex.div(float(size));
      pos.x.assign(col.sub(size / 2).add(0.5));
      pos.y.assign(row.sub(size / 2).add(0.5));
    })().compute(count);

    /**
     * Material
     */

    const material = new SpriteNodeMaterial({
      sizeAttenuation: true,
      positionNode: positionBuffer.toAttribute(),
      scaleNode: float(0.5),
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
    const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 1, 30);

    camera.position.set(0, 2, 5.3);
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

    renderer.setAnimationLoop(animate);

    renderer.compute(initCompute);

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
      material.dispose();
      controls.dispose();
      renderer.dispose();
    }

    return dispose;
  }
}
