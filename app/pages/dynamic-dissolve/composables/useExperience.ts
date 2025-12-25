import {OrbitControls} from "three/examples/jsm/Addons.js";
import {mx_noise_float, oscTriangle, step, time, uv} from "three/tsl";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshStandardNodeMaterial,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGPURenderer,
} from "three/webgpu";

export function useExperience(ref: Ref<HTMLCanvasElement | null>) {
  let disposeFn: (() => void) | null = null;
  whenever(ref, (canvas) => {
    disposeFn = init(canvas);
  });

  onBeforeUnmount(() => {
    disposeFn?.();
  });

  function init(canvas: HTMLCanvasElement) {
    // Scene
    const scene = new Scene();

    /**
     * Lights
     */
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    /**
     * Geometry
     */
    const geometry = new TorusGeometry(1, 0.4, 16, 60);

    /**
     * Material
     */

    const material = new MeshStandardNodeMaterial({
      // colorNode: colorNode(),
      // positionNode: positionNode(),
      transparent: true,
      color: "orange",
      metalness: 0.1,
      roughness: 0.4,
      alphaTest: 0.5,
      // wireframe: true,
    });

    const noiseValue = mx_noise_float(uv().mul(2.0), 0.5, 0.5); // 花纹密度
    const threshold = oscTriangle(time.mul(0.15)); // 速度
    const finalAlpha = step(threshold, noiseValue); // 干净的黑白遮罩
    material.opacityNode = finalAlpha;

    /**
     * Mesh
     */
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

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
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.init().then(() => {
      /**
       * Animate
       */
      renderer.setAnimationLoop(() => {
        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);
      });
    });

    function dispose() {
      geometry.dispose();
      material.dispose();
      controls.dispose();
      renderer.dispose();
    }

    return dispose;
  }
}
