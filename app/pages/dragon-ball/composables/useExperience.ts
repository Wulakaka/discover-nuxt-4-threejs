import {OrbitControls} from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import {
  abs,
  color,
  dot,
  float,
  mix,
  mx_noise_float,
  mx_noise_vec3,
  normalLocal,
  normalView,
  PI2,
  positionLocal,
  positionViewDirection,
  rotate,
  sin,
  smoothstep,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec3,
} from "three/tsl";
import {
  Color,
  CylinderGeometry,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGPURenderer,
} from "three/webgpu";

import dustImage from "@/assets/dragon-ball/dust.webp";

export function useExperience(ref: Ref<HTMLCanvasElement | null>) {
  let disposeFn: (() => void) | null = null;
  whenever(ref, (canvas) => {
    disposeFn = init(canvas);
  });

  onBeforeUnmount(() => {
    disposeFn?.();
  });

  function init(canvas: HTMLCanvasElement) {
    const textureLoader = new TextureLoader();
    const dustTexture = textureLoader.load(dustImage);
    dustTexture.wrapS = dustTexture.wrapT = RepeatWrapping; // RepeatWrapping
    /**
     * gui
     */
    const gui = new GUI();

    // uniforms

    // Scene
    const scene = new Scene();

    /**
     * Geometry
     */
    const ballGeometry = new SphereGeometry(1, 32, 32);

    const ballMaterial = new MeshBasicNodeMaterial({
      // colorNode: finalColor,
      // positionNode: newPosition,
      // opacityNode: opacity,
      // transparent: true,
      // side: 2,
      // // wireframe: true,
    });

    /**
     * Mesh
     */
    const ball = new Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    const dustGeometry = new CylinderGeometry(5.6, 4.2, 2, 256, 1, true);

    const dustMaterial = new MeshBasicNodeMaterial({
      side: 2,
      colorNode: texture(
        dustTexture,
        vec2(uv().x.mul(2).add(time.mul(-1.2)), uv().y.clamp(0, 0.99)),
      ),
      transparent: true,
      depthWrite: false,
    });

    const dust = new Mesh(dustGeometry, dustMaterial);
    scene.add(dust);

    const dust2Geometry = new CylinderGeometry(8.8, 7.4, 2, 256, 1, true);
    const dust2Material = new MeshBasicNodeMaterial({
      side: 2,
      colorNode: texture(
        dustTexture,
        vec2(uv().x.mul(3).add(time.mul(-1.2)), uv().y.clamp(0, 0.99)),
      ),
      transparent: true,
      depthWrite: false,
    });
    const dust2 = new Mesh(dust2Geometry, dust2Material);
    scene.add(dust2);

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
      0.001,
      100,
    );

    camera.position.set(0, 10, 10);
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
      ballGeometry.dispose();
      ballMaterial.dispose();
      controls.dispose();
      renderer.dispose();
      gui.destroy();
    }

    return dispose;
  }
}
