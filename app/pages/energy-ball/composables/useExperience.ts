import {OrbitControls} from "three/examples/jsm/Addons.js";
import {
  mx_noise_float,
  normalLocal,
  normalView,
  oscTriangle,
  PI2,
  positionLocal,
  positionViewDirection,
  sin,
  step,
  time,
  uv,
  vec3,
} from "three/tsl";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
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
     * Geometry
     */
    const geometry = new SphereGeometry(1, 256, 256);

    /**
     * Material
     */

    // 本地坐标
    const pos = positionLocal;
    // normals in camera space
    const normal = normalView;
    // 像素指向 camera
    const viewDir = positionViewDirection;

    // 避免数字过大导致精度问题
    const safeTime = time.mod(600.0);
    // 周期性时间 0 - 2PI
    const periodicTime = time.mod(PI2);
    // 心跳效果 0.93 - 1.07
    const pulse = sin(periodicTime.mul(1.0)).mul(0.07).add(1.0);

    // 放缓时间
    const vortexTime = safeTime.mul(0.1);
    // 决定能量集群在哪里显示
    const vortexNoise = mx_noise_float(
      pos.mul(0.2).add(vec3(0, vortexTime, 0))
    );

    const dispTime = safeTime.mul(0.8);
    const highFreqNoise = mx_noise_float(
      pos.mul(2.0).add(vec3(0, dispTime, 0))
    );

    const combinedDisp = highFreqNoise.mul(vortexNoise).mul(2.0);
    const displacement = normalLocal.mul(combinedDisp.mul(0.12).mul(pulse));
    const position = pos.add(displacement);

    const material = new MeshBasicNodeMaterial({
      // colorNode: colorNode(),
      positionNode: position,
      transparent: true,
      side: 2,
      // wireframe: true,
    });

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
