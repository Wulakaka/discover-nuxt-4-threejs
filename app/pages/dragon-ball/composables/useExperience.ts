import {OrbitControls} from "three/examples/jsm/Addons.js";
import type {float} from "three/tsl";
import {
  abs,
  bool,
  color,
  dot,
  Fn,
  If,
  mix,
  mx_noise_float,
  mx_noise_vec3,
  normalLocal,
  normalView,
  pass,
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
  vec4,
} from "three/tsl";
import {
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  PostProcessing,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  TextureLoader,
  WebGPURenderer,
} from "three/webgpu";
import {bloom} from "three/addons/tsl/display/BloomNode.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";

import dustImage from "@/assets/dragon-ball/dust.webp";
import lightningImage from "@/assets/dragon-ball/lightning.webp";

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
    dustTexture.wrapS = dustTexture.wrapT = RepeatWrapping;

    const lightningTexture = textureLoader.load(lightningImage);
    lightningTexture.wrapS = lightningTexture.wrapT = RepeatWrapping;

    // uniforms

    const lightning1Threshold = uniform(0.24);

    const lightning1YScale = uniform(0.04);

    const lightning1Strength = uniform(3.72);

    const lightning2Threshold = uniform(0.46);

    const lightning2YScale = uniform(0.3);

    const lightning2Strength = uniform(1.57);

    const lightningDarkThreshold = uniform(0.52);

    const lightningDarkYScale = uniform(0.3);

    const lightning1Color = uniform(color("#ff5b24"));

    const lightning2Color = uniform(color("#9effff"));

    const lightningSpeed = uniform(0);

    const sphere1Threshold = uniform(0);

    const sphere2Threshold = uniform(0.4);

    const sphereDarkThreshold = uniform(0.46);

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
    // scene.add(ball);

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
    // scene.add(dust);

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
    // scene.add(dust2);

    const lightningGeometry = new CylinderGeometry(1.6, 1.6, 30, 8, 1, true);

    const outputNode = Fn(
      ({
        yScale,
        threshold,
        strength,
        baseColor,
        shouldInvert,
        xOffset,
      }: {
        yScale: ReturnType<typeof float>;
        threshold: ReturnType<typeof float>;
        strength: ReturnType<typeof float>;
        baseColor: ReturnType<typeof color>;
        shouldInvert: ReturnType<typeof bool>;
        xOffset: number;
      }) => {
        const newUv = uv().toVar();
        newUv.x.addAssign(xOffset);
        newUv.y.mulAssign(yScale);
        newUv.y.subAssign(time.mul(lightningSpeed));
        const r = texture(lightningTexture, newUv).r.toVar();
        r.stepAssign(threshold);
        If(shouldInvert, () => {
          r.oneMinusAssign();
        });
        const finalColor = baseColor.mul(strength).mul(r);
        return vec4(finalColor, r);
      },
    );

    const lightning1Material = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: lightning1YScale,
        threshold: lightning1Threshold,
        strength: lightning1Strength,
        baseColor: lightning1Color,
        shouldInvert: bool(false),
        xOffset: 0,
      }),
    });

    const lightning2Material = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: lightning2YScale,
        threshold: lightning2Threshold,
        strength: lightning2Strength,
        baseColor: lightning2Color,
        shouldInvert: bool(true),
        xOffset: 0.5,
      }),
    });

    const lightningDarkMaterial = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: lightningDarkYScale,
        threshold: lightningDarkThreshold,
        strength: 1,
        baseColor: color("#000000"),
        shouldInvert: bool(false),
        xOffset: 0.75,
      }),
    });

    const lightningGroup = new Group();

    const lightning1 = new Mesh(lightningGeometry, lightning1Material);
    lightning1.scale.set(0.6, 1, 0.6);
    lightning1.rotateZ(-Math.PI / 2);

    const lightning2 = new Mesh(lightningGeometry, lightning2Material);
    lightning2.scale.set(0.8, 1, 0.8);
    lightning2.rotateZ(-Math.PI / 2);

    // 需要先实例化 lightning，再实例化 lightning2
    const lightningDark = new Mesh(lightningGeometry, lightningDarkMaterial);
    lightningDark.rotateZ(-Math.PI / 2);

    lightningGroup.add(lightning1);
    lightningGroup.add(lightning2);
    lightningGroup.add(lightningDark);

    // scene.add(lightningGroup);

    const sphereGroup = new Group();

    const sphereGeometry = new SphereGeometry(1.2, 32, 32);

    const sphere1Material = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: 1,
        threshold: sphere1Threshold,
        strength: lightning1Strength,
        baseColor: lightning1Color,
        shouldInvert: bool(false),
        xOffset: 0,
      }),
    });

    const sphere1 = new Mesh(sphereGeometry, sphere1Material);

    sphereGroup.add(sphere1);

    const sphere2Material = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: 1,
        threshold: sphere2Threshold,
        strength: lightning2Strength,
        baseColor: lightning2Color,
        shouldInvert: bool(false),
        xOffset: 0.5,
      }),
    });

    const sphere2 = new Mesh(sphereGeometry, sphere2Material);
    sphere2.scale.set(1.2, 1.2, 1.2);

    sphereGroup.add(sphere2);

    const sphereDarkMaterial = new MeshBasicNodeMaterial({
      side: 2,
      transparent: true,
      outputNode: outputNode({
        yScale: 1,
        threshold: sphereDarkThreshold,
        strength: 1,
        baseColor: color("#000000"),
        shouldInvert: bool(false),
        xOffset: 0,
      }),
    });

    const sphereDark = new Mesh(sphereGeometry, sphereDarkMaterial);
    sphereDark.scale.set(1.4, 1.4, 1.4);
    sphereGroup.add(sphereDark);

    scene.add(sphereGroup);

    // scene.add(sphere2);
    // const sphereDark = new Mesh(sphereGeometry, lightningDarkMaterial);
    // sphereDark.scale.set(1.4, 1.4, 1.4);
    // scene.add(sphereDark);

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
    renderer.setClearColor(new Color(0x2f2f2f));
    renderer.inspector = new Inspector();

    // post processing
    const postProcessing = new PostProcessing(renderer);

    // 创建 pass node
    const scenePass = pass(scene, camera);
    // Returns the texture node for the given output name.
    const scenePassColor = scenePass.getTextureNode("output");

    const bloomPass = bloom(scenePassColor, 0.42, 0.16, 1);

    postProcessing.outputNode = scenePassColor.add(bloomPass);

    // debug
    const gui = (<Inspector>renderer.inspector).createParameters("调试");

    gui.add(lightningSpeed, "value", 0, 5, 0.01).name("闪电速度");

    const sphereFolder = gui.addFolder("球体");

    sphereFolder.add(sphere1Threshold, "value", 0, 1, 0.01).name("球体1阈值");

    sphereFolder.add(sphere2Threshold, "value", 0, 1, 0.01).name("球体2阈值");

    sphereFolder
      .add(sphereDarkThreshold, "value", 0, 1, 0.01)
      .name("球体黑色部分阈值");

    const lightning1Folder = gui.addFolder("闪电1");

    lightning1Folder
      .add(lightning1Threshold, "value", 0, 1, 0.01)
      .name("闪电1阈值");
    lightning1Folder
      .add(lightning1YScale, "value", 0, 1, 0.01)
      .name("闪电1 Y 轴缩放");
    lightning1Folder
      .add(lightning1Strength, "value", 1, 4, 0.01)
      .name("闪电1强度");

    const lightning2Folder = gui.addFolder("闪电2");
    lightning2Folder
      .add(lightning2Threshold, "value", 0, 1, 0.01)
      .name("闪电2阈值");
    lightning2Folder
      .add(lightning2YScale, "value", 0, 1, 0.01)
      .name("闪电2 Y 轴缩放");
    lightning2Folder
      .add(lightning2Strength, "value", 1, 4, 0.01)
      .name("闪电2强度");

    const lightningDarkFolder = gui.addFolder("黑色闪电");

    lightningDarkFolder
      .add(lightningDarkThreshold, "value", 0, 1, 0.01)
      .name("黑色闪电阈值");
    lightningDarkFolder
      .add(lightningDarkYScale, "value", 0, 1, 0.01)
      .name("黑色闪电 Y 轴缩放");
    lightning1Folder.addColor(lightning1Color, "value").name("闪电1颜色");
    lightning2Folder.addColor(lightning2Color, "value").name("闪电2颜色");

    const bloomGui = gui.addFolder("bloom");
    bloomGui.add(bloomPass.strength, "value", 0, 10, 0.01).name("strength");
    bloomGui.add(bloomPass.radius, "value", 0, 1, 0.01).name("radius");

    renderer.init().then(() => {
      /**
       * Animate
       */
      renderer.setAnimationLoop(() => {
        // Update controls
        controls.update();

        // Render
        // renderer.render(scene, camera);
        postProcessing.render();
      });
    });

    function dispose() {
      ballGeometry.dispose();
      ballMaterial.dispose();
      controls.dispose();
      renderer.dispose();
    }

    return dispose;
  }
}
