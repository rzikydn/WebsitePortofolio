/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports, see the usage snippet for details
import cardGLB from './card.glb';
import lanyard from './lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true, ready = true, inViewport = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [physicsReady, setPhysicsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setPhysicsReady(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use zero gravity during preloader (warm-up), switch to real gravity when ready
  const activeGravity = ready ? gravity : [0, 0, 0];

  return (
    <div 
      className="lanyard-wrapper" 
      style={{ 
        opacity: ready ? 1 : 0, 
        transition: 'opacity 0.3s ease',
        visibility: inViewport ? 'visible' : 'hidden' // Skip painting completely when off-screen
      }}
    >
      <Canvas
        frameloop={inViewport ? "always" : "never"} // Pause WebGL rendering entirely when off-screen
        camera={{ position: isMobile ? [0, 0, 30] : position, fov: fov }}
        dpr={typeof window !== 'undefined' ? [1, Math.min(window.devicePixelRatio, 2)] : [1, 1.5]}
        gl={{ alpha: transparent, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        {physicsReady && (
          <Physics gravity={activeGravity} timeStep={1 / 60} interpolate>
            <Band isMobile={isMobile} ready={ready} />
          </Physics>
        )}
        {/* Lightweight directional light replaces heavy Environment HDR cubemap */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, ready = false }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  // Wake up all rigid bodies when ready (gravity activates)
  useEffect(() => {
    if (ready) {
      [fixed, j1, j2, j3, card].forEach(ref => {
        if (ref.current) {
          ref.current.wakeUp();
        }
      });
    }
  }, [ready]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (!fixed.current || !card.current) return;

    // Optimize: Exit early if the card has gone to sleep and is not being dragged
    const isSleeping = typeof card.current.isSleeping === 'function' ? card.current.isSleeping() : false;
    if (isSleeping && !dragged) {
      return;
    }

    const clampedDelta = Math.min(delta, 1 / 30);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          clampedDelta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 8 : 12));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, isMobile ? 6 : 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} linearDamping={2} angularDamping={1}>
          <BallCollider args={[0.1]} mass={1} sensor />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} linearDamping={2} angularDamping={1}>
          <BallCollider args={[0.1]} mass={1} sensor />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} linearDamping={2} angularDamping={1}>
          <BallCollider args={[0.1]} mass={1} sensor />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} mass={1} sensor />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshStandardMaterial
                map={materials.base.map}
                map-anisotropy={16}
                roughness={0.85}
                metalness={0.7}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [500, 1000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={isMobile ? 0.5 : 1}
        />
      </mesh>
    </>
  );
}

useGLTF.preload(cardGLB);
useTexture.preload(lanyard);