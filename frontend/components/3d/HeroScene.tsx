'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function DressForm({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} castShadow>
        <cylinderGeometry args={[0.4, 0.8, 2.2, 32, 8]} />
        <MeshDistortMaterial
          color="#d4991a"
          metalness={0.9}
          roughness={0.1}
          distort={0.15}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function GoldenOrb({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.2;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });
  return (
    <Float speed={2} rotationIntensity={1}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 64]} />
        <meshStandardMaterial
          color="#efc85a"
          metalness={1}
          roughness={0.05}
          emissive="#d4991a"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const count   = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d4991a" size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function GoldRing({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = rotation[0] + state.clock.elapsedTime * 0.3;
      ref.current.rotation.z = rotation[2] + state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.6, 0.04, 8, 48]} />
      <meshStandardMaterial color="#d4991a" metalness={1} roughness={0.1} emissive="#c8891a" emissiveIntensity={0.3} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#d4991a" />
      <pointLight position={[-5, -3, -5]} intensity={0.8} color="#6b21a8" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" />

      <DressForm position={[-2.5, 0, -1]} />
      <DressForm position={[0,    0,  0]} />
      <DressForm position={[2.5,  0, -1]} />

      <GoldenOrb position={[-4, 2, -2]}  scale={0.5} />
      <GoldenOrb position={[4,  -1, -3]} scale={0.3} />
      <GoldenOrb position={[0,  3,  -4]} scale={0.7} />

      <GoldRing position={[-1.5, 2, -2]}  rotation={[0.5, 0, 0.3]} />
      <GoldRing position={[1.5,  -2, -1]} rotation={[0.2, 0, 0.7]} />

      <FloatingParticles />
      <Sparkles count={80} scale={10} size={1.2} speed={0.4} color="#d4991a" />
      <Environment preset="night" />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene />
    </Canvas>
  );
}
