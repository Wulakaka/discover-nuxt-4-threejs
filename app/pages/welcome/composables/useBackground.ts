import {OrbitControls} from "three/examples/jsm/Addons.js";
import {
  color,
  Fn,
  mix,
  mul,
  mx_noise_float,
  oscSine,
  positionLocal,
  rand,
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

    // 光效果
    const lightStrength = Fn(() => {
      const uvX = uv().x.sub(0.5).div(uv().y.add(0.1)).add(0.5).mul(10);
      const uvY = uv().y.sub(0.5).div(uv().y.add(0.1)).add(0.5).mul(0.5);
      // 增加时间变化
      uvY.subAssign(time.mul(0.4));

      const strength = mx_noise_float(vec2(uvX, uvY));
      strength.smoothstepAssign(-0.5, 0.5);
      // const strength = uvX.fract();
      return strength;
    });

    // 水波效果
    const waveStrength = Fn(() => {
      const uvX = uv().x.add(0.5).mul(3);
      const uvY = uv()
        .y.add(oscSine(time.mul(0.05)))
        .mul(5);
      const wave = mx_noise_float(vec3(uvX, uvY, time));
      wave.smoothstepAssign(-1, 1);
      return wave;
    });

    // 颗粒效果
    const grainStrength = Fn(() => {
      const uvX = uv().x.mul(10);
      const uvY = uv().y.mul(-10);

      return rand(vec2(uvX, uvY));
    });

    const colorNode = Fn(() => {
      const light = lightStrength();
      const wave = waveStrength();

      // 灰色
      const color1 = color("#34495e");
      // 绿色
      const color2 = color("#41b883");

      const c = mix(color1.rgb, color2.rgb, light.remap(0.4, 1));

      const strength = mul(light, wave, grainStrength(), 0.5);

      return vec4(c, strength);
    });

    const positionNode = Fn(() => {
      return positionLocal;
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
