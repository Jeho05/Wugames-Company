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
}

const MOUNTAIN_LAYERS = [
  { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
  { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
  { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
  { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
];

export function HorizonHeroSection({ title, subtitle }: {
  title: string;
  subtitle: { line1: string; line2: string };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const threeRefs = useRef<ThreeRefs>({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [], atmosphere: null, animationId: null,
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
        refs.camera.position.x = Math.sin(time * 0.05) * 5;
        refs.camera.position.y = 20 + Math.cos(time * 0.08) * 2;
        refs.camera.lookAt(0, 10, -600);
      }

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

    gsap.set([titleRef.current, subtitleRef.current], { visibility: 'visible' });

    const tl = gsap.timeline();
    const titleChars = titleRef.current?.querySelectorAll('.title-char');
    if (titleChars?.length) {
      tl.from(titleChars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: 'power4.out' });
    }

    const subtitleLines = subtitleRef.current?.querySelectorAll('.subtitle-line');
    if (subtitleLines?.length) {
      tl.from(subtitleLines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8');
    }

    return () => { tl.kill(); };
  }, [isReady]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none text-center px-6 sm:px-8">
        <h1 ref={titleRef} className="text-[clamp(2.8rem,13vw,8rem)] font-black tracking-[0.08em] leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]" style={{ visibility: 'hidden' }}>
          {title.split('').map((char, i) => (
            <span key={i} className="title-char inline-block">{char}</span>
          ))}
        </h1>
        <div ref={subtitleRef} className="mt-4 sm:mt-6 text-[clamp(0.85rem,2.5vw,1.3rem)] text-amber-200/60 font-light tracking-[0.06em] space-y-1 max-w-2xl" style={{ visibility: 'hidden' }}>
          <p className="subtitle-line">{subtitle.line1}</p>
          <p className="subtitle-line">{subtitle.line2}</p>
        </div>
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
      const choice = Math.random();
      if (choice < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
      else if (choice < 0.9) color.setHSL(0.08, 0.5, 0.8);
      else color.setHSL(0.6, 0.5, 0.8);

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
      color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide,
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
  refs.atmosphere = atmosphere;
}
