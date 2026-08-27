import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export const ThreeHeroOrb = ({ className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Geometry & Material for the Central 3D Celestial Blob
    const geometry = new THREE.IcosahedronGeometry(1.4, 64);
    
    // Save original position attribute for procedural vertex wave animation
    const posAttr = geometry.attributes.position;
    const originalPositions = posAttr.array.slice();

    // Wireframe Outer Holographic Ring
    const wireGeo = new THREE.IcosahedronGeometry(1.45, 12);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Inner iridescent organic mesh
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x071126,
      emissive: 0x5b21b6,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.6,
      ior: 1.5,
      transparent: true,
      opacity: 0.92,
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x9b6cff, 4.5, 50);
    pointLight1.position.set(3, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x66b7ff, 3.5, 50);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffb39c, 3.0, 50);
    pointLight3.position.set(0, -3, -3);
    scene.add(pointLight3);

    // Floating Stardust Particles Galaxy around the Orb
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.9 + Math.random() * 1.5;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      particleScales[i] = Math.random();
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse tilt tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = y * 0.45;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse interpolation
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      sphereMesh.rotation.x = currentRotationX + time * 0.08;
      sphereMesh.rotation.y = currentRotationY + time * 0.12;

      wireMesh.rotation.x = -currentRotationX + time * 0.04;
      wireMesh.rotation.y = -currentRotationY + time * 0.06;

      particles.rotation.y = time * 0.05;
      particles.rotation.x = time * 0.02;

      // Morphing Vertex displacement
      const positions = posAttr.array;
      for (let i = 0; i < posAttr.count; i++) {
        const u = i * 3;
        const ox = originalPositions[u];
        const oy = originalPositions[u + 1];
        const oz = originalPositions[u + 2];

        // Harmonic organic waves
        const wave =
          Math.sin(ox * 2.5 + time * 1.8) * 0.12 +
          Math.cos(oy * 2.8 + time * 1.5) * 0.12 +
          Math.sin(oz * 2.2 + time * 2.1) * 0.08;

        positions[u] = ox * (1 + wave);
        positions[u + 1] = oy * (1 + wave);
        positions[u + 2] = oz * (1 + wave);
      }
      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      wireGeo.dispose();
      material.dispose();
      wireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-auto ${className}`}
      style={{ minHeight: "380px" }}
    />
  );
};

export default ThreeHeroOrb;
