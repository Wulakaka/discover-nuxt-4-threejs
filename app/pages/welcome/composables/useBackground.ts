import {OrbitControls} from "three/examples/jsm/Addons.js";
import {
  Fn,
  mx_noise_float,
  positionLocal,
  time,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import {
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  WebGPURenderer,
} from "three/webgpu";

export function useBackground(ref: Ref<HTMLCanvasElement | null>) {
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
     * Loaders
     */

    /**
     * Geometry
     */
    const geometry = new PlaneGeometry(1, 1, 1, 1);

    /**
     * Material
     */

    const colorNode = Fn(() => {
      const uvX = uv().x.sub(0.5).div(uv().y.add(0.1)).add(0.5).mul(20);
      const uvY = uv()
        .y.mul(0.75)
        .div(uv().y.add(1).mul(0.25))
        .sub(time.mul(0.4));
      const strength = mx_noise_float(vec2(uvX, uvY));
      strength.step(0);
      return vec4(1, 1, 1, strength);
    });

    const positionNode = Fn(() => {
      const x = positionLocal.x;
      const y = positionLocal.y;
      const z = positionLocal.z;
      // x.mulAssign(float(1).add(y));
      // y.addAssign(y.sub(-1).pow(2));
      return vec3(x, y, z);
    });

    const material = new MeshBasicNodeMaterial({
      colorNode: colorNode(),
      positionNode: positionNode(),
      transparent: true,
      // wireframe: true,
    });

    /**
     * Mesh
     */
    const box = new Mesh(geometry, material);
    scene.add(box);

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
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    // camera.position.y = 5;
    camera.position.z = 2;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    // controls.target.set(0, 1.5, -2.25);
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
