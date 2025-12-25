import {OrbitControls} from "three/examples/jsm/Addons.js";
import {
  abs,
  color,
  dot,
  mix,
  mx_noise_float,
  mx_noise_vec3,
  normalLocal,
  normalView,
  oscTriangle,
  PI2,
  positionLocal,
  positionViewDirection,
  rotate,
  sin,
  smoothstep,
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
    const newPosition = pos.add(displacement);

    const vortexStrength = smoothstep(0, 1, vortexNoise);
    const baseRotation = safeTime.mul(0.1);
    // 旋转90度
    const vortexRotation = vortexStrength.mul(90);
    const totalRotationY = baseRotation.add(vortexRotation);
    // 旋转两个轴
    const rotatedPos = rotate(pos, vec3(totalRotationY, totalRotationY, 0));
    // 添加噪波扰动，避免过于规则
    const distortionScale = 1.5;
    const distortion = mx_noise_vec3(rotatedPos.mul(distortionScale));
    const perturbedPos = rotatedPos.add(distortion.mul(0.3));

    const mainTime = safeTime.mul(1.5);
    const baseCoord = perturbedPos.add(vec3(0, mainTime, 0));

    // 创建色散效果
    const noiseR = mx_noise_float(baseCoord.sub(vec3(0.1)));
    const elecR = abs(noiseR).oneMinus().pow(6.7);

    const noiseG = mx_noise_float(baseCoord);
    const elecG = abs(noiseG).oneMinus().pow(6.7);

    const noiseB = mx_noise_float(baseCoord.add(vec3(0.1)));
    const elecB = abs(noiseB).oneMinus().pow(6.7);

    // 电流效果
    const electricityColor = vec3(elecR, elecG, elecB);

    const pulsedElectricity = electricityColor.mul(pulse);

    // 高光效果
    const coreMask = smoothstep(0.96, 1.0, elecG);
    const fresnel = dot(viewDir, normal).oneMinus().pow(1.1);
    // 分层
    let finalColor = color("#000000");
    const cyanColor = color("#00ffff").mul(0.3);
    finalColor = finalColor.add(cyanColor.mul(pulsedElectricity));

    const whiteColor = color("#00ffff").mul(10.0);
    finalColor = mix(finalColor, whiteColor, coreMask);

    // 制作 fresnel 高光
    finalColor = finalColor.add(
      color("#00aaff").mul(0.0).mul(fresnel).mul(pulse)
    );

    const opacity = elecG.add(fresnel).smoothstep(0.3, 0.7);

    // 颜色基调
    const tintColor = color("#00ffff");
    const baseColor = tintColor.mul(pulsedElectricity);

    const baseOpacity = elecG.smoothstep(0.3, 0.7);

    const material = new MeshBasicNodeMaterial({
      colorNode: finalColor,
      positionNode: newPosition,
      opacityNode: opacity,
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
