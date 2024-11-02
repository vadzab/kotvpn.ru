import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

// Интерфейсы для компонентов
interface ImageLayerProps {
  url: string;
  depth: number;
  positionZ: number;
  fixedToBottomLeft?: boolean;
  opacity?: number;
}

interface BackgroundProps {
  url: string;
}

interface StaticBackgroundProps {
  url: string;
}

// Шейдер размытия для StaticBackground
const StaticBlurShader = {
  uniforms: {
    uTexture: { value: null },
    uMouseDistance: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uMouseDistance;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      float dist = uMouseDistance;
      vec4 color = vec4(0.0);
      float total = 0.0;

      for (float x = -4.0; x <= 4.0; x++) {
        for (float y = -4.0; y <= 4.0; y++) {
          vec2 offset = vec2(x, y) * dist * 0.002;
          color += texture2D(uTexture, uv + offset);
          total += 1.0;
        }
      }
      gl_FragColor = color / total;
    }
  `,
};

// Шейдер размытия для Background
const AnimatedBlurShader = {
  uniforms: {
    uTexture: { value: null },
    uMouseDistance: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: StaticBlurShader.vertexShader,
  fragmentShader: StaticBlurShader.fragmentShader,
};

// Статичный фон с управляемым блюром
const StaticBackground: React.FC<StaticBackgroundProps> = ({ url }) => {
  const texture = useLoader(TextureLoader, url);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  
  useFrame(({ mouse }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.ShaderMaterial;

      const distanceFromCenter = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
      material.uniforms.uMouseDistance.value = Math.max(0.3 - distanceFromCenter * 0.5, 0);
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -6]}>
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5]} />
      <shaderMaterial
        uniforms-uTexture={{ value: texture }}
        uniforms-uMouseDistance={{ value: 0.0 }}
        {...StaticBlurShader}
        transparent
      />
    </mesh>
  );
};

// Анимированный фон с блюром
const Background: React.FC<BackgroundProps> = ({ url }) => {
  const texture = useLoader(TextureLoader, url);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  useFrame(({ mouse }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.ShaderMaterial;

      ref.current.rotation.y = mouse.x * 0.05;
      ref.current.rotation.x = -mouse.y * 0.02;

      const distanceFromCenter = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
      material.uniforms.uMouseDistance.value = Math.min(distanceFromCenter * 0.5, 0.3);
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <planeGeometry args={[viewport.width * 2.1, viewport.height * 2.1]} />
      <shaderMaterial
        uniforms-uTexture={{ value: texture }}
        uniforms-uMouseDistance={{ value: 0.0 }}
        {...AnimatedBlurShader}
        transparent
      />
    </mesh>
  );
};

// Компонент ImageLayer для отображения одного слоя изображения
const ImageLayer: React.FC<ImageLayerProps> = ({ url, depth, positionZ, fixedToBottomLeft = false, opacity = 1 }) => {
  const texture = useLoader(TextureLoader, url);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const [position] = useState<[number, number]>([0, 0]);

  useFrame(({ mouse }) => {
    if (ref.current) {
      // Если изображение должно быть закреплено в нижнем левом углу
      if (fixedToBottomLeft) {
        // Позиция в нижнем левом углу с учетом размера viewport
        ref.current.position.x = -viewport.width / 2 + 1.8; // Смещение на 2 для отступа
        ref.current.position.y = -viewport.height / 2 + 1.5; // Смещение на 1.5 для отступа
      }

      // Параллакс-эффект при движении мыши
      ref.current.position.x += (mouse.x * depth) / viewport.width;
      ref.current.position.y += (mouse.y * depth) / viewport.height;

      // Добавляем поворот по оси Y в зависимости от положения мыши
      ref.current.rotation.y = mouse.x * 0.1 * depth; // Коэффициент 0.1 управляет амплитудой поворота
    }
  });

  return (
    <mesh ref={ref} position={[position[0], position[1], positionZ]}>
      <planeGeometry args={[5, 5]} /> {/* Размер слоя */}
      <meshBasicMaterial map={texture} transparent opacity={opacity} />
    </mesh>
  );
};

// Основная сцена
export const Scene: React.FC = () => {
  return (
    <Canvas>
      <StaticBackground url="/bg-main.png" />  {/* Статичный фоновый слой */}
      <Background url="/bg4.png" />  {/* Анимированный фон */}

      {/* Слой изображения с параллаксом */}
      <ImageLayer url="/image.png" depth={0.5} positionZ={-0.5} fixedToBottomLeft opacity={1} />
    </Canvas>
  );
};