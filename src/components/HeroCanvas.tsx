'use client';

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom Liquid Image Shader
const CustomLiquidShaderMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uMouse: new THREE.Vector2(0.5, 0.5),
    uTime: 0,
    uScrollSpeed: 0,
    uResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    uniform vec2 uMouse;
    uniform float uScrollSpeed;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Subtly warp plane vertices based on scroll speed
      float distToMouse = distance(uv, uMouse);
      pos.z += sin(uv.y * 4.0) * (uScrollSpeed * 1.5);
      pos.z += cos(uv.x * 4.0) * (uScrollSpeed * 1.5);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uTime;
    uniform float uScrollSpeed;
    uniform vec2 uResolution;

    void main() {
      vec2 uv = vUv;

      // Displace texture mapping around mouse coordinates
      float dist = distance(uv, uMouse);
      if (dist < 0.25) {
        float strength = (1.0 - (dist / 0.25)) * 0.035;
        // Liquid swirl ripple effect
        uv.x += sin(uTime * 3.0 + uv.y * 12.0) * strength;
        uv.y += cos(uTime * 3.0 + uv.x * 12.0) * strength;
      }

      // Dynamic cinematic color distortion (aberration)
      vec4 rCol = texture2D(uTexture, uv + vec2(uScrollSpeed * 0.01, 0.0));
      vec4 gCol = texture2D(uTexture, uv);
      vec4 bCol = texture2D(uTexture, uv - vec2(uScrollSpeed * 0.01, 0.0));

      gl_FragColor = vec4(rCol.r, gCol.g, bCol.b, 1.0);
    }
  `
);

extend({ CustomLiquidShaderMaterial });

// Internal mesh wrapper inside Canvas
function ShaderMesh({ imageSrc }: { imageSrc: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const texture = useTexture(imageSrc);
  const { size } = useThree();

  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef({ last: 0, speed: 0 });

  useEffect(() => {
    // Keep aspect ratio of texture in mind to avoid stretch
    if (materialRef.current && texture.image) {
      const img = texture.image as HTMLImageElement;
      const imgAspect = img.width / img.height;
      const viewAspect = size.width / size.height;
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates [0, 1] relative to viewport
      mouseRef.current.x = e.clientX / window.innerWidth;
      // Invert Y for WebGL coordinates
      mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight);
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - scrollRef.current.last;
      scrollRef.current.last = currentScroll;
      
      // Calculate scroll speed with decay
      scrollRef.current.speed = Math.max(-0.5, Math.min(0.5, delta * 0.03));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [texture, size]);

  useFrame((state) => {
    if (!materialRef.current) return;

    // Tick time
    materialRef.current.uTime = state.clock.getElapsedTime();

    // Lerp mouse coordinates
    const curMouse = materialRef.current.uMouse;
    curMouse.x += (mouseRef.current.x - curMouse.x) * 0.08;
    curMouse.y += (mouseRef.current.y - curMouse.y) * 0.08;

    // Lerp scroll speed back to 0
    scrollRef.current.speed += (0 - scrollRef.current.speed) * 0.06;
    materialRef.current.uScrollSpeed = scrollRef.current.speed;

    // Add plane rotation based on mouse offset for parallax feel
    if (meshRef.current) {
      const targetRX = (mouseRef.current.y - 0.5) * 0.15;
      const targetRY = (mouseRef.current.x - 0.5) * 0.15;
      meshRef.current.rotation.x += (targetRX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRY - meshRef.current.rotation.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[16, 10, 32, 32]} />
      {/* @ts-ignore */}
      <customLiquidShaderMaterial
        ref={materialRef}
        uTexture={texture}
        uTexture-minFilter={THREE.LinearFilter}
      />
    </mesh>
  );
}

export default function HeroCanvas({ imageSrc }: { imageSrc: string }) {
  const [shouldRenderWebGL, setShouldRenderWebGL] = useState(false);

  useEffect(() => {
    // Accessibility check: disable if prefers-reduced-motion is true
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Disable WebGL on mobile/touch screens to preserve battery/cpu
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setShouldRenderWebGL(!prefersReducedMotion && !isMobile);
  }, []);

  if (!shouldRenderWebGL) {
    // Plain image fallback
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt="Cinematic Hero"
          className="w-full h-full object-cover filter grayscale contrast-110 opacity-70"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ShaderMesh imageSrc={imageSrc} />
        </Suspense>
      </Canvas>
    </div>
  );
}
