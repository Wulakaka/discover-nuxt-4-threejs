import {OrbitControls} from "three/examples/jsm/Addons.js";
import {Inspector} from "three/examples/jsm/inspector/Inspector.js";
import {Fn} from "three/src/nodes/TSL.js";
import {
  cos,
  cross,
  dot,
  float,
  instancedBufferAttribute,
  normalize,
  PI2,
  rand,
  sin,
  time,
  vec3,
} from "three/tsl";
import {
  IcosahedronGeometry,
  InstancedBufferAttribute,
  MeshBasicNodeMaterial,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteNodeMaterial,
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
    const geometry = new IcosahedronGeometry(1, 1);

    /**
     * Material
     */

    const material = new MeshBasicNodeMaterial({
      transparent: true,
      side: 2,
      wireframe: true,
    });

    /**
     * Mesh
     */
    // const mesh = new Mesh(geometry, material);
    // scene.add(mesh);

    /**
     * Sprite
     */
    const aPosition = new InstancedBufferAttribute(
      geometry.getAttribute("position").array.slice(),
      3
    );

    const pos = instancedBufferAttribute(aPosition);

    const spriteMaterial = new SpriteNodeMaterial({
      sizeAttenuation: true,
      scaleNode: float(0.1),
    });

    spriteMaterial.positionNode = Fn(() => {
      const scaledTime = time.mul(1);
      const theta = scaledTime;

      const k = normalize(pos);
      const vCos = pos.mul(cos(theta));
      const kxv = cross(k, pos);
      const kxvSin = kxv.mul(sin(theta));
      const kDotV = dot(k, pos);
      const kDotVTerm = k.mul(kDotV.mul(float(1).sub(cos(theta))));

      const rotatedPosition = vCos.add(kxvSin).add(kDotVTerm);

      return rotatedPosition;
    })();

    const sprite = new Sprite(spriteMaterial);
    sprite.count = geometry.getAttribute("position").count;
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
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.inspector = new Inspector();

    renderer.setAnimationLoop(animate);

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
      geometry.dispose();
      material.dispose();
      controls.dispose();
      renderer.dispose();
    }

    return dispose;
  }
}
