'use client';
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function ProductMesh({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.5, 0.9, 2.8, 48, 16]} />
        <MeshDistortMaterial
          color={color}
          metalness={0.6}
          roughness={0.2}
          distort={0.1}
          speed={1.5}
          envMapIntensity={1}
        />
      </mesh>
      {/* Collar detail */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.52, 0.06, 8, 32]} />
        <meshStandardMaterial color="#d4991a" metalness={1} roughness={0.1} />
      </mesh>
      {/* Hem detail */}
      <mesh position={[0, -1.45, 0]}>
        <torusGeometry args={[0.92, 0.05, 8, 32]} />
        <meshStandardMaterial color="#d4991a" metalness={1} roughness={0.1} />
      </mesh>
    </Float>
  );
}

interface ProductViewerProps {
  color?: string;
}

export default function ProductViewer({ color = '#1a1a2e' }: ProductViewerProps) {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]}   intensity={1.5} color="#d4991a" castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#9333ea" />
        <spotLight position={[0, 10, 0]} intensity={1} angle={0.4} penumbra={1} castShadow />

        <Suspense fallback={null}>
          <ProductMesh color={color} />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={6} blur={2.5} far={4} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
