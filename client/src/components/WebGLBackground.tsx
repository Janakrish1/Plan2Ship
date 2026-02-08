import { useRef, useEffect } from "react";
import * as THREE from "three";

export function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Primary particle field
    const count = 1200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.06,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xa78bfa,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Second particle layer (smaller, cyan, different motion)
    const count2 = 800;
    const positions2 = new Float32Array(count2 * 3);
    for (let i = 0; i < count2; i++) {
      positions2[i * 3] = (Math.random() - 0.5) * 24;
      positions2[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions2[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geometry2 = new THREE.BufferGeometry();
    geometry2.setAttribute("position", new THREE.BufferAttribute(positions2, 3));
    const material2 = new THREE.PointsMaterial({
      size: 0.04,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x22d3ee,
      sizeAttenuation: true,
    });
    const points2 = new THREE.Points(geometry2, material2);
    points2.rotation.x = 0.2;
    scene.add(points2);

    // Torus knot (wireframe style)
    const torusGeometry = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
      depthWrite: false,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-2, 1.5, -4);
    torus.scale.setScalar(1.2);
    scene.add(torus);

    // Floating ring
    const ringGeometry = new THREE.TorusGeometry(1.8, 0.03, 16, 48);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(3, -0.5, -3);
    ring.rotation.x = Math.PI * 0.3;
    scene.add(ring);

    // Gradient orbs with bobbing
    const orb1 = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      })
    );
    orb1.position.set(4, 2, -3);
    scene.add(orb1);

    const orb2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      })
    );
    orb2.position.set(-3, -1, -2);
    scene.add(orb2);

    const orb3 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      })
    );
    orb3.position.set(2, -2, -5);
    scene.add(orb3);

    let frameId: number;
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      points.rotation.y = t * 0.035;
      points.rotation.x = Math.sin(t * 0.3) * 0.04;
      points2.rotation.y = t * -0.025;
      points2.rotation.x = 0.2 + Math.sin(t * 0.5) * 0.08;
      torus.rotation.y = t * 0.28;
      torus.rotation.x = t * 0.14;
      ring.rotation.z = t * 0.12;
      ring.position.y = -0.5 + Math.sin(t * 0.9) * 0.2;
      orb1.rotation.y = t * 0.2;
      orb1.position.y = 2 + Math.sin(t * 0.6) * 0.28;
      orb2.rotation.y = -t * 0.15;
      orb2.position.x = -3 + Math.cos(t * 0.5) * 0.2;
      orb3.rotation.x = t * 0.15;
      orb3.rotation.y = t * 0.12;
      orb3.position.y = -2 + Math.sin(t * 0.7) * 0.3;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      geometry2.dispose();
      torusGeometry.dispose();
      ringGeometry.dispose();
      material.dispose();
      material2.dispose();
      torusMaterial.dispose();
      ringMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden" />;
}
