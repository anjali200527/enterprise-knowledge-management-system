import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';

const AnimatedSphere = () => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.1;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color="#c0c0c0"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.1}
        metalness={0.9}
        transparent={true}
        opacity={0.8}
        wireframe={true}
      />
    </Sphere>
  );
};

const KnowledgeSphere3D = () => {
  return (
    <div className="knowledge-sphere-container" style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <AnimatedSphere />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default KnowledgeSphere3D;
