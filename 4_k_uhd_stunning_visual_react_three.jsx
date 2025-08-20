import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function StunningVisual4K() {
  const mountRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000010, 0.002);

    const camera = new THREE.PerspectiveCamera(
      70,
      mount.clientWidth / mount.clientHeight,
      0.1,
      3000
    );
    camera.position.set(0, 0, 420);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 120;
    controls.maxDistance = 900;

    const COUNT = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      let x, y, z;
      do {
        x = (Math.random() * 2 - 1);
        y = (Math.random() * 2 - 1);
        z = (Math.random() * 2 - 1);
      } while (x * x + y * y + z * z > 1);

      const radius = 900 * Math.cbrt(Math.random());
      const px = x * radius;
      const py = y * radius;
      const pz = z * radius;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      const color = new THREE.Color();
      color.setHSL((px * 0.0005 + 0.6 + Math.random() * 0.05) % 1, 1.0, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 4 + 1.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const sprite = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/spark1.png");

    const material = new THREE.PointsMaterial({
      size: 5.0,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: sprite,
      alphaTest: 0.01
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const starGeom = new THREE.BufferGeometry();
    const starCount = 4000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 6000;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 6000;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 6000;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({ color: 0x88aaff, size: 1, sizeAttenuation: true })
    );
    scene.add(stars);

    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      const arr = geometry.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        const x = arr[i];
        const z = arr[i + 2];
        arr[i + 1] += Math.sin(t * 0.8 + (x + z) * 0.003) * 0.35;
      }
      geometry.attributes.position.needsUpdate = true;

      particles.rotation.y += 0.0007;
      particles.rotation.x += 0.00025;
      stars.rotation.y += 0.0002;

      controls.update();
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      starGeom.dispose();
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute left-3 top-3 text-white/80 text-sm backdrop-blur rounded-2xl px-3 py-2 border border-white/10">
        Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
}
