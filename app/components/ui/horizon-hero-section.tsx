"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface ThreeRefs {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  stars: THREE.Points[];
  nebula: THREE.Mesh | null;
  mountains: THREE.Mesh[];
  atmosphere: THREE.Mesh | null;
  animationId: number | null;
  targetCameraX: number;
  targetCameraY: number;
  targetCameraZ: number;
  mountainBaseZ: number[];
}

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

const HERO_VH = 3;

export function HorizonHeroSection({ title, subtitle, sections }: {
  title: string;
  subtitle: { line1: string; line2: string };
  sections: Array<{ title: string; line1: string; line2: string }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroProgress, setHeroProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const threeRefs = useRef<ThreeRefs>({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [], atmosphere: null,
    animationId: null, targetCameraX: 0, targetCameraY: 30, targetCameraZ: 300, mountainBaseZ: [],
  });

  useEffect(() => {
    const refs = threeRefs.current;
    if (!canvasRef.current) return;

    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    refs.camera.position.set(0, 20, 100);

    refs.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current, antialias: true, alpha: true,
    });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.5;

    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.3, 0.85
    );
    refs.composer.addPass(bloomPass);
    refs.composer.addPass(new OutputPass());

    createStarField(refs);
    createNebula(refs);
    createMountains(refs);
    createAtmosphere(refs);
    refs.mountainBaseZ = refs.mountains.map((m) => m.position.z);

    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      refs.stars.forEach((starField) => {
        if (starField.material instanceof THREE.ShaderMaterial && starField.material.uniforms.time) {
          starField.material.uniforms.time.value = time;
        }
      });

      if (refs.nebula?.material instanceof THREE.ShaderMaterial && refs.nebula.material.uniforms.time) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      if (refs.atmosphere?.material instanceof THREE.ShaderMaterial && refs.atmosphere.material.uniforms.time) {
        refs.atmosphere.material.uniforms.time.value = time;
      }

      if (refs.camera) {
        const sp = smoothCameraPos.current;
        sp.x += (refs.targetCameraX - sp.x) * 0.05;
        sp.y += (refs.targetCameraY - sp.y) * 0.05;
        sp.z += (refs.targetCameraZ - sp.z) * 0.05;

        refs.camera.position.x = sp.x + Math.sin(time * 0.1) * 2;
        refs.camera.position.y = sp.y + Math.cos(time * 0.15) * 1;
        refs.camera.position.z = sp.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((mountain, i) => {
        const pf = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * pf;
        mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * pf;
      });

      refs.composer?.render();
    };

    animate();

    const handleResize = () => {
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    setIsReady(true);

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener('resize', handleResize);

      refs.stars.forEach((s) => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      refs.mountains.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose(); }
      if (refs.atmosphere) { refs.atmosphere.geometry.dispose(); (refs.atmosphere.material as THREE.Material).dispose(); }
      refs.renderer?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    gsap.set([titleRef.current, subtitleRef.current, scrollIndicatorRef.current], {
      visibility: 'visible',
    });

    const tl = gsap.timeline();

    const titleChars = titleRef.current?.querySelectorAll('.title-char');
    if (titleChars?.length) {
      tl.from(titleChars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' });
    }

    const subtitleLines = subtitleRef.current?.querySelectorAll('.subtitle-line');
    if (subtitleLines?.length) {
      tl.from(subtitleLines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    }

    tl.from(scrollIndicatorRef.current, { opacity: 0, y: 50, duration: 1, ease: 'power2.out' }, '-=0.5');

    return () => { tl.kill(); };
  }, [isReady]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollY / Math.max(maxScroll, 1), 1);

      const rawHeroProgress = Math.min(scrollY / (window.innerHeight * HERO_VH), 1);

      setScrollProgress(progress);
      setHeroProgress(rawHeroProgress);

      const newSection = Math.min(Math.floor(progress * sections.length), sections.length - 1);

      const refs = threeRefs.current;
      const totalProgress = progress * sections.length;
      const sectionProgress = totalProgress % 1;

      const currentPos = CAMERA_POSITIONS[newSection];
      const nextPos = CAMERA_POSITIONS[Math.min(newSection + 1, CAMERA_POSITIONS.length - 1)];

      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;

      refs.mountains.forEach((mountain, i) => {
        const baseZ = refs.mountainBaseZ[i] ?? MOUNTAIN_LAYERS[i]?.distance ?? -200;
        const speed = 1 + i * 0.5;
        const targetZ = baseZ + scrollY * speed * 0.3;
        mountain.position.z += (targetZ - mountain.position.z) * 0.05;

        if (refs.camera) {
          const camZ = refs.camera.position.z;
          const behind = Math.max(0, (mountain.position.z - camZ) / 150);
          (mountain.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - behind);
        }
      });

      if (refs.nebula && refs.mountains[3]) {
        refs.nebula.position.z = refs.mountains[3].position.z - 800;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections.length]);

  const overlayOpacity = Math.max(0, 1 - heroProgress * 1.67);
  const indicatorOpacity = Math.max(0, 1 - heroProgress * 1.25);
  const canvasOverlayOpacity = Math.min(Math.max(0, (heroProgress - 0.35) / 0.65), 0.92);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] bg-black text-white overflow-hidden font-sans">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      <div
        className="absolute inset-0 z-[1] bg-black pointer-events-none transition-opacity duration-300"
        style={{ opacity: canvasOverlayOpacity }}
      />

      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none text-center px-6 sm:px-8"
        style={{ opacity: overlayOpacity }}
      >
        <h1 ref={titleRef} className="text-[clamp(2.8rem,13vw,8rem)] font-black tracking-[0.08em] leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]">
          {title.split('').map((char, i) => (
            <span key={i} className="title-char inline-block">{char}</span>
          ))}
        </h1>
        <div ref={subtitleRef} className="mt-4 sm:mt-6 text-[clamp(0.85rem,2.5vw,1.3rem)] text-amber-200/60 font-light tracking-[0.06em] space-y-1 max-w-2xl">
          <p className="subtitle-line">{subtitle.line1}</p>
          <p className="subtitle-line">{subtitle.line2}</p>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: indicatorOpacity, visibility: indicatorOpacity > 0 ? 'visible' : 'hidden' }}
      >
        <div className="text-[10px] tracking-[0.3em] text-white/30 font-mono uppercase">DÉCOUVRIR</div>
        <div className="w-20 sm:w-28 h-px bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400/80 to-blue-500/80 transition-all duration-150"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 pointer-events-none">
        {Array.from({ length: sections.length }, (_, i) => (
          <section key={i} className="h-screen" />
        ))}
      </div>
    </div>
  );
}

function createStarField(refs: ThreeRefs) {
  const scene = refs.scene;
  if (!scene) return;
  const starCount = 5000;

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
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      } else if (colorChoice < 0.9) {
        color.setHSL(0.08, 0.5, 0.8);
      } else {
        color.setHSL(0.6, 0.5, 0.8);
      }

      colors[j * 3] = color.r;
      colors[j * 3 + 1] = color.g;
      colors[j * 3 + 2] = color.b;
      sizes[j] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, depth: { value: i } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform float depth;
        void main() {
          vColor = color;
          vec3 pos = position;
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
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    refs.stars.push(stars);
  }
}

function createNebula(refs: ThreeRefs) {
  const scene = refs.scene;
  if (!scene) return;

  const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(0x17294b) },
      color2: { value: new THREE.Color(0xe3a641) },
      opacity: { value: 0.2 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vElevation;
      uniform float time;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
        pos.z += elevation;
        vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float opacity;
      uniform float time;
      varying vec2 vUv;
      varying float vElevation;
      void main() {
        float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
        vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
        float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
        alpha *= 1.0 + vElevation * 0.01;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const nebula = new THREE.Mesh(geometry, material);
  nebula.position.z = -1050;
  scene.add(nebula);
  refs.nebula = nebula;
}

function createMountains(refs: ThreeRefs) {
  const scene = refs.scene;
  if (!scene) return;

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
      color: layer.color,
      transparent: true,
      opacity: layer.opacity,
      side: THREE.DoubleSide,
    });

    const mountain = new THREE.Mesh(geometry, material);
    mountain.position.z = layer.distance;
    mountain.position.y = layer.distance + 120;
    scene.add(mountain);
    refs.mountains.push(mountain);
  });
}

function createAtmosphere(refs: ThreeRefs) {
  const scene = refs.scene;
  if (!scene) return;

  const geometry = new THREE.SphereGeometry(600, 32, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
        float pulse = sin(time * 2.0) * 0.1 + 0.9;
        atmosphere *= pulse;
        gl_FragColor = vec4(atmosphere, intensity * 0.25);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  const atmosphere = new THREE.Mesh(geometry, material);
  scene.add(atmosphere);
  refs.atmosphere = atmosphere;
}
