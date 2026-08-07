import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type PerformanceMode = "high" | "medium" | "low" | "fallback";

const CAMERA_POSITIONS = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 40, z: -50 },
  { x: 0, y: 50, z: -700 },
];

const MOUNTAIN_LAYERS = [
  { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
  { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
  { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
  { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
];

function detectPerformanceMode(): PerformanceMode {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    return "fallback";
  }

  const cores = navigator.hardwareConcurrency || 2;

  if (cores >= 8) {
    return "high";
  } else if (cores >= 4) {
    return "medium";
  } else {
    return "low";
  }
}

export interface HorizonSceneCallbacks {
  onProgress?: (progress: number) => void;
  onReady?: () => void;
}

export function createHorizonScene(
  canvas: HTMLCanvasElement,
  sectionCount: number,
  callbacks: HorizonSceneCallbacks,
): () => void {
  const performanceMode = detectPerformanceMode();

  if (performanceMode === "fallback") {
    window.setTimeout(() => callbacks.onReady?.(), 0);
    return () => undefined;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 20, 100);

  let renderer: THREE.WebGLRenderer | null = null;
  let composer: EffectComposer | null = null;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
  } catch {
    window.setTimeout(() => callbacks.onReady?.(), 0);
    return () => undefined;
  }

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  if (performanceMode === "high" || performanceMode === "medium") {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.3, 0.85,
    );
    composer.addPass(bloomPass);
  }

  composer.addPass(new OutputPass());

  const stars: THREE.Points[] = [];
  const mountains: THREE.Mesh[] = [];
  let nebula: THREE.Mesh | null = null;
  let atmosphere: THREE.Mesh | null = null;

  const starMultiplier = performanceMode === "high" ? 1 : performanceMode === "medium" ? 0.6 : 0.3;
  createStarField(scene, stars, starMultiplier);
  createNebula(scene, (m) => (nebula = m));
  createMountains(scene, mountains);

  if (performanceMode === "high") {
    createAtmosphere(scene, (m) => (atmosphere = m));
  }

  const mountainBaseZ = mountains.map((m) => m.position.z);
  const smoothCameraPos = { x: 0, y: 30, z: 100 };
  let animationId: number | null = null;

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    stars.forEach((starField) => {
      if (starField.material instanceof THREE.ShaderMaterial && starField.material.uniforms.time) {
        starField.material.uniforms.time.value = time;
      }
    });

    if (nebula?.material instanceof THREE.ShaderMaterial && nebula.material.uniforms.time) {
      nebula.material.uniforms.time.value = time * 0.5;
    }

    if (atmosphere?.material instanceof THREE.ShaderMaterial && atmosphere.material.uniforms.time) {
      atmosphere.material.uniforms.time.value = time;
    }

    smoothCameraPos.x += (cameraTarget.x - smoothCameraPos.x) * 0.03;
    smoothCameraPos.y += (cameraTarget.y - smoothCameraPos.y) * 0.03;
    smoothCameraPos.z += (cameraTarget.z - smoothCameraPos.z) * 0.03;

    camera.position.x = smoothCameraPos.x + Math.sin(time * 0.1) * 2;
    camera.position.y = smoothCameraPos.y + Math.cos(time * 0.15) * 1;
    camera.position.z = smoothCameraPos.z;
    camera.lookAt(0, 10, -600);

    mountains.forEach((mountain, i) => {
      const pf = 1 + i * 0.5;
      mountain.position.x = Math.sin(time * 0.1) * 2 * pf;
      mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * pf;
    });

    composer?.render();
  };

  const cameraTarget = { x: 0, y: 30, z: 300 };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
    composer?.setSize(window.innerWidth, window.innerHeight);
  };

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - window.innerHeight;
    const progress = Math.min(scrollY / Math.max(maxScroll, 1), 1);

    callbacks.onProgress?.(Math.min(scrollY / (window.innerHeight * sectionCount), 1));

    const cameraCount = CAMERA_POSITIONS.length - 1;
    const cameraIndex = Math.min(Math.floor(progress * cameraCount), cameraCount - 1);
    const cameraFrac = (progress * cameraCount) % 1;

    const cur = CAMERA_POSITIONS[cameraIndex];
    const next = CAMERA_POSITIONS[Math.min(cameraIndex + 1, cameraCount)];

    cameraTarget.x = cur.x + (next.x - cur.x) * cameraFrac;
    cameraTarget.y = cur.y + (next.y - cur.y) * cameraFrac;
    cameraTarget.z = cur.z + (next.z - cur.z) * cameraFrac;

    mountains.forEach((mountain, i) => {
      const baseZ = mountainBaseZ[i] ?? MOUNTAIN_LAYERS[i]?.distance ?? -200;
      const targetZ = baseZ + scrollY * (1 + i * 0.5) * 0.15;
      mountain.position.z += (targetZ - mountain.position.z) * 0.05;

      const behind = Math.max(0, (mountain.position.z - camera.position.z) / 150);
      (mountain.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - behind);
    });

    if (nebula && mountains[3]) {
      nebula.position.z = mountains[3].position.z - 800;
    }
  };

  animate();

  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  window.setTimeout(() => callbacks.onReady?.(), 0);

  return () => {
    if (animationId !== null) cancelAnimationFrame(animationId);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", handleScroll);

    stars.forEach((s) => {
      s.geometry.dispose();
      if (s.material instanceof THREE.Material) {
        s.material.dispose();
      }
    });

    mountains.forEach((m) => {
      m.geometry.dispose();
      if (m.material instanceof THREE.Material) {
        m.material.dispose();
      }
    });

    if (nebula) {
      nebula.geometry.dispose();
      if (nebula.material instanceof THREE.Material) {
        nebula.material.dispose();
      }
    }

    if (atmosphere) {
      atmosphere.geometry.dispose();
      if (atmosphere.material instanceof THREE.Material) {
        atmosphere.material.dispose();
      }
    }

    if (composer) {
      composer.passes.forEach((pass) => {
        if ("dispose" in pass && typeof pass.dispose === "function") {
          pass.dispose();
        }
      });
    }

    renderer?.dispose();
  };
}

function createStarField(scene: THREE.Scene, stars: THREE.Points[], multiplier: number = 1) {
  const starCount = Math.floor(5000 * multiplier);

  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let j = 0; j < starCount; j++) {
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[j * 3 + 2] = radius * Math.cos(phi);

      const color = new THREE.Color();
      const choice = Math.random();
      if (choice < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      else if (choice < 0.9) color.setHSL(0.08, 0.5, 0.8);
      else color.setHSL(0.6, 0.5, 0.8);

      colors[j * 3] = color.r;
      colors[j * 3 + 1] = color.g;
      colors[j * 3 + 2] = color.b;
      sizes[j] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: i } },
      vertexShader: `
        attribute float size; attribute vec3 color;
        varying vec3 vColor; uniform float time; uniform float depth;
        void main() {
          vColor = color; vec3 pos = position;
          float angle = time * 0.05 * (1.0 - depth * 0.3);
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pos.xy = rot * pos.xy;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);
    stars.push(starField);
  }
}

function createNebula(scene: THREE.Scene, setNebula: (mesh: THREE.Mesh) => void) {
  const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x17294b) },
      color2: { value: new THREE.Color(0xe3a641) },
      opacity: { value: 0.15 },
    },
    vertexShader: `
      varying vec2 vUv; varying float vElevation; uniform float time;
      void main() {
        vUv = uv; vec3 pos = position;
        float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
        pos.z += elevation; vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
      varying vec2 vUv; varying float vElevation;
      void main() {
        float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        alpha *= 1.0 + vElevation * 0.01;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
  });

  const nebula = new THREE.Mesh(geometry, material);
  nebula.position.z = -1050;
  scene.add(nebula);
  setNebula(nebula);
}

function createMountains(scene: THREE.Scene, mountains: THREE.Mesh[]) {
  MOUNTAIN_LAYERS.forEach((layer) => {
    const points: THREE.Vector2[] = [];
    const segments = 50;
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * 1000;
      const y = Math.sin(i * 0.1) * layer.height +
               Math.sin(i * 0.05) * layer.height * 0.5 +
               Math.random() * layer.height * 0.2 - 100;
      points.push(new THREE.Vector2(x, y));
    }
    points.push(new THREE.Vector2(5000, -300));
    points.push(new THREE.Vector2(-5000, -300));

    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide,
    });

    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.z = layer.distance;
    mountain.position.y = layer.distance + 120;
    scene.add(mountain);
    mountains.push(mountain);
  });
}

function createAtmosphere(scene: THREE.Scene, setAtmosphere: (mesh: THREE.Mesh) => void) {
  const geometry = new THREE.SphereGeometry(600, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal; varying vec3 vPosition; uniform float time;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        atmosphere *= pulse;
        gl_FragColor = vec4(atmosphere, intensity * 0.25);
      }
    `,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
  });

  const atmosphere = new THREE.Mesh(geometry, material);
  scene.add(atmosphere);
  setAtmosphere(atmosphere);
}
