import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
// Импорт изображений из папки src/assets
import bgStaticPNG from './assets/bg-main-min.png';
import bgPNG from './assets/bg4-min.png';
import kotPNG from './assets/kot.png';

// Интерфейсы для компонентов
interface ImageLayerProps {
  img: string;
  depth: number;
  positionZ: number;
  fixedToBottomLeft?: boolean;
  opacity?: number;
}

interface BackgroundProps {
  img: string;
}

interface StaticBackgroundProps {
  img: string;
}

// Шейдер для Background с размытие ближе к центру
const BackgroundBlurShader = {
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
          vec2 offset = vec2(x, y) * dist * 0.0025;
          color += texture2D(uTexture, uv + offset);
          total += 1.0;
        }
      }
      gl_FragColor = color / total;
    }
  `,
};

// Шейдер для StaticBackground с размытие дальше от центра
const StaticBackgroundBlurShader = {
  uniforms: {
    uTexture: { value: null },
    uMouseDistance: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: BackgroundBlurShader.vertexShader,
  fragmentShader: BackgroundBlurShader.fragmentShader,
};

// StaticBackground компонент с новым условием размытия
const StaticBackground: React.FC<StaticBackgroundProps> = ({ img }) => {
  const texture = useLoader(TextureLoader, img);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  useFrame(({ mouse }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.ShaderMaterial;

      const distanceFromCenter = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
      // Увеличенное размытие, если курсор далеко от центра
      material.uniforms.uMouseDistance.value = Math.max((distanceFromCenter - 0.3) * 0.5, 0);
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -6]}>
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5]} />
      <shaderMaterial
        uniforms-uTexture={{ value: texture }}
        uniforms-uMouseDistance={{ value: 0.0 }}
        {...StaticBackgroundBlurShader}
        transparent
      />
    </mesh>
  );
};

// Background компонент с размытие ближе к центру
const Background: React.FC<BackgroundProps> = ({ img }) => {
  const texture = useLoader(TextureLoader, img);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  const aspectRatio = texture.image.width / texture.image.height;
  const width = 2 * viewport.width;
  const height = 2 * viewport.width / aspectRatio;

  const smoothRotationX = useRef(0);
  const smoothRotationY = useRef(0);

  useFrame(({ mouse }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.ShaderMaterial;

      smoothRotationX.current += (mouse.x * 0.05 - smoothRotationX.current) * 0.1;
      smoothRotationY.current += (-mouse.y * 0.02 - smoothRotationY.current) * 0.1;

      ref.current.rotation.y = smoothRotationX.current;
      ref.current.rotation.x = smoothRotationY.current;

      const distanceFromCenter = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
      // Размытие увеличивается при приближении к центру
      material.uniforms.uMouseDistance.value = Math.max(0.3 - distanceFromCenter * 0.5, 0);
      material.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        uniforms-uTexture={{ value: texture }}
        uniforms-uMouseDistance={{ value: 0.0 }}
        {...BackgroundBlurShader}
        transparent
      />
    </mesh>
  );
};

// Компонент ImageLayer для отображения одного слоя изображения с плавностью
const ImageLayer: React.FC<ImageLayerProps> = ({ img, depth, positionZ, fixedToBottomLeft = false, opacity = 1 }) => {
  const texture = useLoader(TextureLoader, img);
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Фиксированная позиция компонента в нижнем левом углу
  const fixedX = -viewport.width / 2 + 1.8;
  const fixedY = -viewport.height / 2 + 1.5;

  // Плавные значения для вращения и смещения
  const smoothOffsetX = useRef(0);
  const smoothOffsetY = useRef(0);
  const smoothRotationY = useRef(0);

  useFrame(({ mouse }) => {
    if (ref.current) {
      // Целевое смещение и вращение на основе положения мыши
      const targetOffsetX = mouse.x * depth * 0.3;
      const targetOffsetY = mouse.y * depth * 0.3;
      const targetRotationY = mouse.x * 0.2 * depth;

      // Плавное приближение текущих значений к целевым
      smoothOffsetX.current += (targetOffsetX - smoothOffsetX.current) * 0.1;
      smoothOffsetY.current += (targetOffsetY - smoothOffsetY.current) * 0.1;
      smoothRotationY.current += (targetRotationY - smoothRotationY.current) * 0.1;

      // Устанавливаем итоговую позицию и вращение
      ref.current.position.set(fixedX + smoothOffsetX.current, fixedY + smoothOffsetY.current, positionZ);
      ref.current.rotation.y = smoothRotationY.current;
    }
  });

  return (
    <mesh ref={ref} position={[fixedX, fixedY, positionZ]}>
      <planeGeometry args={[5, 5]} /> {/* Размер слоя */}
      <meshBasicMaterial map={texture} transparent opacity={opacity} />
    </mesh>
  );
};

// Основная сцена
export const Scene: React.FC = () => {
  return (
    <Canvas data-testid="scene" >
      <StaticBackground img={bgStaticPNG} />
      <Background img={bgPNG} />
      <ImageLayer img={kotPNG} depth={0.5} positionZ={-0.5} fixedToBottomLeft opacity={1} />
    </Canvas>
  );
};