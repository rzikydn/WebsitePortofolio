/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// Direct public asset paths: avoids redundant bundling in dist/_astro and matches browser preload
const cardGLBUrl = '/card.glb?v=2';
const lanyardUrl = '/lanyard.webp';

// Preload 3D assets immediately so they are cached before preloader finishes
useGLTF.preload(cardGLBUrl);
useTexture.preload(lanyardUrl);

const TOP_ANCHOR_OFFSET = new THREE.Vector3(0, 10, 0);

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true, ready = true, inViewport = true, onLoaded }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [physicsReady] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  const handleLoaded = () => {
    setIsLoaded(true);
    if (onLoaded) onLoaded();
  };

  useEffect(() => {
    // Safety fallback: ensure lanyard becomes visible even if texture takes time
    const t = setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSleeping(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use zero gravity during preloader (warm-up), switch to real gravity when ready
  const activeGravity = ready ? gravity : [0, 0, 0];

  // Pause WebGL rendering entirely when off-screen, render on-demand when idle/sleeping
  const frameloop = !inViewport ? "never" : isSleeping ? "demand" : "always";

  return (
    <div 
      className="lanyard-wrapper" 
      style={{ 
        opacity: isLoaded ? 1 : 0, 
        transition: 'opacity 0.3s ease',
        visibility: inViewport ? 'visible' : 'hidden' // Skip painting completely when off-screen
      }}
    >
      <Canvas
        frameloop={frameloop}
        camera={{ position: isMobile ? [0, 0, 27] : position, fov: fov }}
        dpr={typeof window !== 'undefined' ? [1, Math.min(window.devicePixelRatio, 2)] : [1, 2]}
        gl={{ alpha: transparent, antialias: true, powerPreference: "high-performance", stencil: false }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        {physicsReady && (
          <Physics gravity={activeGravity} timeStep={1 / 60} interpolate>
            <Band 
              key={isMobile ? 'mobile' : 'desktop'}
              isMobile={isMobile} 
              ready={ready} 
              onLoaded={handleLoaded} 
              onSleepChange={setIsSleeping}
            />
          </Physics>
        )}
        {/* Lightweight directional light replaces heavy Environment HDR cubemap */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
      </Canvas>
    </div>
  );
}
function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, ready = false, onLoaded, onSleepChange }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3(),
    hookVec = new THREE.Vector3(),
    quat = new THREE.Quaternion();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLBUrl);
  const texture = useTexture(lanyardUrl);

  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
    if (materials?.base?.map) {
      materials.base.map.generateMipmaps = true;
      materials.base.map.minFilter = THREE.LinearMipmapLinearFilter;
      materials.base.map.magFilter = THREE.LinearFilter;
      materials.base.map.anisotropy = 16;
      materials.base.map.needsUpdate = true;
    }
    if (onLoaded && nodes && texture) {
      onLoaded();
    }
  }, [nodes, texture, materials, onLoaded]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  const divisions = 20;
  const [cachedPoints] = useState(() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      pts.push(new THREE.Vector3());
    }
    return pts;
  });

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, isMobile ? 1.7 : 1.765, 0]
  ]);

  const sleepFrames = useRef(0);

  const wakeUpAll = () => {
    if (onSleepChange) onSleepChange(false);
    sleepFrames.current = 0;
    [fixed, j1, j2, j3, card].forEach(ref => {
      if (ref.current) {
        ref.current.wakeUp();
      }
    });
  };

  // Wake up all rigid bodies when ready (gravity activates)
  useEffect(() => {
    if (ready) {
      wakeUpAll();
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

    const isSleeping = typeof card.current.isSleeping === 'function' ? card.current.isSleeping() : false;
    if (ready && isSleeping && !dragged) {
      sleepFrames.current += 1;
      if (sleepFrames.current > 15) {
        if (sleepFrames.current === 16 && onSleepChange) {
          onSleepChange(true);
        }
        return;
      }
    } else {
      if (sleepFrames.current >= 16) {
        if (onSleepChange) onSleepChange(false);
      }
      sleepFrames.current = 0;
    }

    const clampedDelta = Math.min(delta, 1 / 30);
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      wakeUpAll();
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        if (isSleeping && !dragged) {
          ref.current.lerped.copy(ref.current.translation());
        } else {
          const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
          ref.current.lerped.lerp(
            ref.current.translation(),
            clampedDelta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
          );
        }
      });

      // Lock strap bottom endpoint directly to the top horizontal bar of the card's D-ring handle
      const cardTrans = card.current.translation();
      const cardRot = card.current.rotation();
      quat.set(cardRot.x, cardRot.y, cardRot.z, cardRot.w);
      hookVec.set(0, isMobile ? 1.695 : 1.755, 0).applyQuaternion(quat).add(cardTrans);

      curve.points[0].copy(hookVec);
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      curve.points[4].copy(fixed.current.translation()).add(TOP_ANCHOR_OFFSET);
      
      // Zero-allocation curve point updates: directly write into pre-allocated vectors
      for (let i = 0; i <= divisions; i++) {
        curve.getPoint(i / divisions, cachedPoints[i]);
      }
      band.current.geometry.setPoints(cachedPoints);

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      const isMotionActive = Math.abs(ang.x) > 0.002 || Math.abs(ang.y) > 0.002 || Math.abs(ang.z) > 0.002 || Math.abs(rot.y) > 0.003;
      if (isMotionActive || dragged) {
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, isMobile ? 6.2 : 4.065, 0]}>
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
          <CuboidCollider args={[isMobile ? 0.8 : 0.92, isMobile ? 1.125 : 1.28, 0.01]} mass={1} sensor />
          <group
            scale={isMobile ? 2.45 : 2.55}
            position={[0, isMobile ? -1.3 : -1.36, -0.05]}
            onPointerOver={() => { hover(true); wakeUpAll(); }}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))),
              wakeUpAll()
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
          resolution={[1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={isMobile ? 0.55 : 0.6}
        />
      </mesh>
    </>
  );
}