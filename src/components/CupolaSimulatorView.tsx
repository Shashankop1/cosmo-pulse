import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CupolaSimulatorViewProps {
  onNavigateToScreen: (screenId: string) => void;
  currentTimeStr: string;
}

export const CupolaSimulatorView: React.FC<CupolaSimulatorViewProps> = ({
  onNavigateToScreen,
  currentTimeStr
}) => {
  const [activeBand, setActiveBand] = useState<'rgb' | 'ndvi' | 'lowlux' | 'uv'>('rgb');
  const [opticalMagnification, setOpticalMagnification] = useState<'1.0x' | '2.5x' | '5.0x'>('1.0x');
  const [fovAngle, setFovAngle] = useState(52);
  const [defogActive, setDefogActive] = useState(true);
  const [carrierAudioActive, setCarrierAudioActive] = useState(true);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Three.js Cupola Observer Viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060c, 0.0005);

    const camera = new THREE.PerspectiveCamera(fovAngle, width / height, 0.1, 3000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x182035, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 3.8);
    sunLight.position.set(45, 20, -15);
    scene.add(sunLight);

    const earthReflection = new THREE.DirectionalLight(0x4488cc, 1.8);
    earthReflection.position.set(0, -30, 20);
    scene.add(earthReflection);

    // Starfield
    const starCount = 3800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    const cCyan = new THREE.Color(0x66fcf1);
    const cPurple = new THREE.Color(0xc77dff);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 350 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i3 + 2] = r * Math.cos(phi);

      const rnd = Math.random();
      const c = rnd < 0.2 ? cCyan : rnd < 0.4 ? cPurple : cWhite;
      starCols[i3] = c.r;
      starCols[i3 + 1] = c.g;
      starCols[i3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.25, vertexColors: true, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Earth Group
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -22, -18);
    scene.add(earthGroup);

    function createHighResEarthTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(cvs);

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0a1d37');
      grad.addColorStop(0.35, '#0e3860');
      grad.addColorStop(0.65, '#092542');
      grad.addColorStop(1, '#051224');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Alps, Po Valley & Mediterranean coastline simulation
      ctx.fillStyle = '#1c4232';
      for (let i = 0; i < 70; i++) {
        ctx.beginPath();
        const x = Math.random() * 1024;
        const y = 80 + Math.random() * 340;
        ctx.arc(x, y, 25 + Math.random() * 85, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#8c6b3e';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        const x = Math.random() * 1024;
        const y = 140 + Math.random() * 200;
        ctx.arc(x, y, 15 + Math.random() * 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // City light constellations
      ctx.fillStyle = 'rgba(255, 214, 102, 0.7)';
      for (let i = 0; i < 280; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, 110 + Math.random() * 280, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cloud swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 1024, 70 + Math.random() * 370, 70 + Math.random() * 140, 10 + Math.random() * 26, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(cvs);
    }

    const earthRadius = 32;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 80, 80);
    const earthMat = new THREE.MeshPhongMaterial({
      map: createHighResEarthTexture(),
      bumpScale: 0.15,
      shininess: 35,
      specular: new THREE.Color(0x336699)
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Rim
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.035, 64, 64);
    const atmosMat = new THREE.MeshLambertMaterial({
      color: 0x66fcf1,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // Auroral Oval
    const auroraGeo = new THREE.RingGeometry(earthRadius * 0.65, earthRadius * 0.88, 48);
    const auroraMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const auroraRing = new THREE.Mesh(auroraGeo, auroraMat);
    auroraRing.rotation.x = Math.PI / 2.2;
    auroraRing.position.set(0, earthRadius * 0.82, 0);
    earthGroup.add(auroraRing);

    // Reticle Vector
    const reticleGroup = new THREE.Group();
    const reticleRing = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x66fcf1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    reticleGroup.add(reticleRing);

    const reticleCrossH = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x66fcf1, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    reticleGroup.add(reticleCrossH);

    const reticleCrossV = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 3.0),
      new THREE.MeshBasicMaterial({ color: 0x66fcf1, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    reticleGroup.add(reticleCrossV);

    reticleGroup.position.set(0, 0, earthRadius + 0.2);
    reticleGroup.lookAt(0, 0, 0);
    earthGroup.add(reticleGroup);

    // Canadarm2 in exterior view
    const armGroup = new THREE.Group();
    armGroup.position.set(11, -3, -9);
    armGroup.rotation.set(0.3, -0.6, 0.4);
    scene.add(armGroup);

    const armMat = new THREE.MeshPhongMaterial({ color: 0xe5e7eb });
    const boom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 9, 16), armMat);
    boom1.position.y = 4.5;
    armGroup.add(boom1);

    const boom2Group = new THREE.Group();
    boom2Group.position.y = 9;
    boom2Group.rotation.z = -0.9;
    armGroup.add(boom2Group);

    const boom2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 8, 16), armMat);
    boom2.position.y = 4;
    boom2Group.add(boom2);

    // Pan controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let camYaw = 0;
    let camPitch = -0.3;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDragging = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        camYaw -= dx * 0.0035;
        camPitch -= dy * 0.0035;
        camPitch = Math.max(-1.1, Math.min(0.6, camPitch));
        prevMouse = { x: e.clientX, y: e.clientY };
      } else {
        const mx = (e.clientX / window.innerWidth) * 2 - 1;
        const my = -(e.clientY / window.innerHeight) * 2 + 1;
        camera.rotation.y = camYaw + mx * 0.04;
        camera.rotation.x = camPitch + my * 0.03;
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      earthMesh.rotation.y += 0.0009;
      auroraRing.rotation.z += 0.0015;

      const retScale = 1.0 + Math.sin(elapsed * 3.5) * 0.08;
      reticleRing.scale.set(retScale, retScale, retScale);

      boom2Group.rotation.z = -0.9 + Math.sin(elapsed * 0.6) * 0.05;

      if (isDragging) {
        camera.rotation.y = camYaw;
        camera.rotation.x = camPitch;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [fovAngle]);

  const handleTakeSnapshot = () => {
    setSnapshotFeedback('4K FRAME CAPTURED');
    setTimeout(() => setSnapshotFeedback(null), 2500);
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-7rem)] overflow-hidden select-none">
      {/* 3D Earth Nadir Viewport Base Layer */}
      <div className="relative w-full h-[calc(100vh-7rem)] min-h-[720px] bg-[#0b0e17] overflow-hidden flex flex-col justify-between">
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* ========================================================= */}
        {/* CUPOLA 7-WINDOW AEROSPACE STRUT HUD FRAMEWORK (SVG) */}
        {/* ========================================================= */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {/* Lens Vignette & Vignette Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,19,28,0)_35%,rgba(11,14,23,0.65)_70%,rgba(7,8,13,0.95)_100%)]" />

          {/* Cupola Strut Framework SVG */}
          <svg
            className="w-full h-full absolute inset-0 object-cover opacity-90"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1920 1080"
          >
            <defs>
              <radialGradient cx="50%" cy="50%" id="strutSheen" r="50%">
                <stop offset="0%" stopColor="#272a34" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#181b25" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0b0e17" stopOpacity="1" />
              </radialGradient>
            </defs>

            {/* Central Circular Nadir Window Outer Ring Strut */}
            <circle cx="960" cy="540" r="395" fill="none" stroke="#272a34" strokeWidth="18" className="opacity-80" />
            <circle cx="960" cy="540" r="384" stroke="#62f9ee" strokeWidth="1.5" className="opacity-30" />
            <circle cx="960" cy="540" r="378" fill="none" stroke="#0b0e17" strokeWidth="6" />

            {/* Aerospace Radial Struts */}
            <path d="M 685 265 L 120 -80" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="36" />
            <path d="M 685 265 L 120 -80" stroke="#3cdcd1" strokeDasharray="8 12" strokeWidth="1" className="opacity-40" />

            <path d="M 960 145 L 960 -120" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="38" />
            <path d="M 960 145 L 960 -120" stroke="#3cdcd1" strokeDasharray="14 8" strokeWidth="1" className="opacity-40" />

            <path d="M 1235 265 L 1800 -80" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="36" />
            <path d="M 1235 265 L 1800 -80" stroke="#3cdcd1" strokeDasharray="8 12" strokeWidth="1" className="opacity-40" />

            <path d="M 1235 815 L 1820 1160" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="36" />
            <path d="M 960 935 L 960 1200" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="38" />
            <path d="M 685 815 L 100 1160" stroke="url(#strutSheen)" strokeLinecap="round" strokeWidth="36" />

            {/* Outer perimeter ellipse */}
            <ellipse cx="960" cy="540" rx="890" ry="510" fill="none" stroke="#1c1f29" strokeWidth="32" className="opacity-70" />

            {/* Targeting Reticle & Pitch Ladder */}
            <g className="opacity-70" stroke="#3cdcd1" strokeWidth="1">
              <line x1="960" x2="960" y1="480" y2="520" />
              <line x1="960" x2="960" y1="560" y2="600" />
              <line x1="900" x2="940" y1="540" y2="540" />
              <line x1="980" x2="1020" y1="540" y2="540" />
              <circle cx="960" cy="540" r="18" strokeDasharray="3 3" />
              <circle cx="960" cy="540" r="110" strokeDasharray="2 12" strokeWidth="0.75" className="opacity-50" />
              {/* Corner brackets */}
              <path d="M 860 460 L 860 440 L 880 440" />
              <path d="M 1060 460 L 1060 440 L 1040 440" />
              <path d="M 860 620 L 860 640 L 880 640" />
              <path d="M 1060 620 L 1060 640 L 1040 640" />
            </g>
          </svg>
        </div>

        {/* LAYER 2: TOP OBSERVER HUD */}
        <div className="relative z-30 w-full px-4 sm:px-6 pt-2 flex flex-col gap-2">
          {/* Telemetry Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 bg-[#0b0e17]/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-[#3c4948]/30 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272a34] border border-[#3c4948]/40">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse" />
                <span className="font-mono-telemetry text-xs font-semibold tracking-wider text-white">
                  CUPOLA NADIR OPTICAL SENSOR 01
                </span>
                <span className="text-[#bacac7] font-mono-telemetry text-[11px] hidden sm:inline">
                  // 4K 60FPS LIVE
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 font-mono-telemetry text-xs text-[#bacac7]">
                <span className="text-[#62f9ee]">LATENCY:</span>
                <span className="text-white tabular-nums">84ms</span>
                <span className="px-1.5 py-0.5 rounded bg-[#1c1f29] text-[#3cdcd1]">
                  LOS GOLDSTONE
                </span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-x-6 gap-y-1 font-mono-telemetry text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#bacac7] uppercase text-[10px]">SUB-POINT:</span>
                <span className="text-[#62f9ee] font-bold tabular-nums">42.18° N, 18.45° E</span>
                <span className="text-[#bacac7] text-[11px]">(ADRIATIC SEA)</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[#bacac7] uppercase text-[10px]">ALT:</span>
                <span className="text-white tabular-nums">418.4 KM</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[#bacac7] uppercase text-[10px]">VELOCITY:</span>
                <span className="text-white tabular-nums">27,612 KM/H (7.67 KM/S)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#ffba27] uppercase text-[10px]">TERMINATOR IN:</span>
                <span className="text-[#ffba27] font-bold tabular-nums">18m 42s</span>
              </div>
            </div>
          </div>

          {/* Mode Navigation Pills */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#0b0e17]/70 backdrop-blur-md rounded-2xl border border-[#3c4948]/30">
              <button
                onClick={() => onNavigateToScreen('iss-live-tracker')}
                className="px-3.5 py-1.5 rounded-xl text-[#bacac7] hover:text-white hover:bg-[#272a34] transition font-mono-telemetry text-[11px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">globe</span>
                <span>3D Geocentric Orbit</span>
              </button>
              <button
                onClick={() => onNavigateToScreen('iss-live-tracker')}
                className="px-3.5 py-1.5 rounded-xl text-[#bacac7] hover:text-white hover:bg-[#272a34] transition font-mono-telemetry text-[11px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">map</span>
                <span>2D Mercator Track</span>
              </button>
              <button
                className="px-3.5 py-1.5 rounded-xl bg-[#62f9ee] text-[#00716b] font-bold font-mono-telemetry text-[11px] tracking-wider uppercase shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>Cupola Cam [LIVE]</span>
              </button>
              <button
                onClick={() => alert('Switching direct video downlink feed to Canadarm2 End-Effector High-Definition Camera')}
                className="px-3.5 py-1.5 rounded-xl text-[#bacac7] hover:text-white hover:bg-[#272a34] transition font-mono-telemetry text-[11px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">precision_manufacturing</span>
                <span>Canadarm2 Cam</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#0b0e17]/70 backdrop-blur-md px-4 py-1.5 rounded-2xl font-mono-telemetry text-xs text-[#bacac7] border border-[#3c4948]/30">
              <span className="material-symbols-outlined text-[16px] text-[#62f9ee]">explore</span>
              <span>NADIR VECTOR LOCK</span>
              <span className="text-white tabular-nums">AZ 174.2° / EL -89.4°</span>
            </div>
          </div>
        </div>

        {/* LAYER 3: FLANKING CONTROL DECKS */}
        <div className="relative z-30 w-full px-4 sm:px-6 flex justify-between items-start pointer-events-none mt-auto mb-auto">
          {/* LEFT DECK: Sensor & Optics Suite */}
          <div className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] bg-[#0b0e17]/85 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#3c4948]/40 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#62f9ee]">tune</span>
                <span className="font-space text-sm sm:text-base font-bold text-white">
                  Spectral & Lens Optics
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#272a34] text-[#3cdcd1] font-mono-telemetry text-[10px] uppercase font-bold">
                SYS: NOMINAL
              </span>
            </div>

            {/* Bands */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono-telemetry text-[10px] uppercase text-[#bacac7] tracking-wider">
                OBSERVATION BAND
              </span>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => setActiveBand('rgb')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    activeBand === 'rgb'
                      ? 'bg-[#272a34] text-white border border-[#62f9ee]/40'
                      : 'bg-[#181b25] text-[#bacac7] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#62f9ee]" />
                    <span className="font-sans text-xs font-medium">Visible Spectrum (RGB)</span>
                  </div>
                  <span className="font-mono-telemetry text-[10px] text-[#62f9ee] uppercase">[ACTIVE]</span>
                </button>

                <button
                  onClick={() => setActiveBand('ndvi')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    activeBand === 'ndvi'
                      ? 'bg-[#272a34] text-white border border-[#62f9ee]/40'
                      : 'bg-[#181b25] text-[#bacac7] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#859491]" />
                    <span className="font-sans text-xs">Near-Infrared (NDVI / Therm)</span>
                  </div>
                  <span className="font-mono-telemetry text-[10px] text-[#bacac7]">850nm</span>
                </button>

                <button
                  onClick={() => setActiveBand('lowlux')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    activeBand === 'lowlux'
                      ? 'bg-[#272a34] text-white border border-[#62f9ee]/40'
                      : 'bg-[#181b25] text-[#bacac7] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#859491]" />
                    <span className="font-sans text-xs">Night Light Intensifier</span>
                  </div>
                  <span className="font-mono-telemetry text-[10px] text-[#bacac7]">LOW-LUX</span>
                </button>

                <button
                  onClick={() => setActiveBand('uv')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                    activeBand === 'uv'
                      ? 'bg-[#272a34] text-white border border-[#62f9ee]/40'
                      : 'bg-[#181b25] text-[#bacac7] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#859491]" />
                    <span className="font-sans text-xs">Hyperspectral Cloud Strat</span>
                  </div>
                  <span className="font-mono-telemetry text-[10px] text-[#e1b6ff]">UV/SWIR</span>
                </button>
              </div>
            </div>

            {/* Magnification Controls */}
            <div className="flex flex-col gap-2.5 bg-[#181b25] p-3 rounded-xl border border-[#272a34]">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-[10px] uppercase text-[#bacac7]">
                  OPTICAL MAGNIFICATION
                </span>
                <div className="flex items-center gap-1 font-mono-telemetry text-xs">
                  {(['1.0x', '2.5x', '5.0x'] as const).map((mag) => (
                    <button
                      key={mag}
                      onClick={() => setOpticalMagnification(mag)}
                      className={`px-2 py-0.5 rounded-lg cursor-pointer transition ${
                        opticalMagnification === mag
                          ? 'bg-[#62f9ee] text-[#00716b] font-bold'
                          : 'bg-[#272a34] text-[#bacac7] hover:text-white'
                      }`}
                    >
                      {mag}
                    </button>
                  ))}
                </div>
              </div>

              {/* FOV Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between font-mono-telemetry text-xs">
                  <span className="text-[#bacac7] uppercase text-[10px]">ANGULAR FIELD (FOV)</span>
                  <span className="text-[#62f9ee] tabular-nums">{fovAngle.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="75"
                  value={fovAngle}
                  onChange={(e) => setFovAngle(parseInt(e.target.value))}
                  className="w-full accent-[#62f9ee] h-1.5 bg-[#272a34] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[#bacac7] font-mono-telemetry text-[9px]">
                  <span>WIDE 28°</span>
                  <span>TELE 75°</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-sans text-xs text-white">Auto Anti-Glare Defog</span>
                <button
                  type="button"
                  onClick={() => setDefogActive(!defogActive)}
                  className={`w-8 h-4 rounded-full flex items-center px-0.5 cursor-pointer transition ${
                    defogActive ? 'bg-[#62f9ee] justify-end' : 'bg-[#32343f] justify-start'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#0b0e17]" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#181b25] font-mono-telemetry text-[11px] border border-[#272a34]">
              <div className="flex items-center gap-1.5 text-[#bacac7]">
                <span className="material-symbols-outlined text-[15px] text-[#62f9ee]">shield</span>
                <span>SHUTTERS 1-7:</span>
              </div>
              <span className="text-[#62f9ee] font-bold uppercase">RETRACTED (100% APERTURE)</span>
            </div>
          </div>

          {/* RIGHT DECK: AI Earth Recognition Deck */}
          <div className="pointer-events-auto w-88 max-w-[calc(100vw-2rem)] bg-[#0b0e17]/85 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#3c4948]/40 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">satellite_alt</span>
                <span className="font-space text-sm sm:text-base font-bold text-white">
                  AI Earth Recognition
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#691a9f] text-[#d69eff] font-mono-telemetry text-[10px] uppercase font-bold">
                GEO-NEURAL V4
              </span>
            </div>

            {/* Target Card */}
            <div className="bg-[#181b25] p-3 rounded-xl border border-[#272a34] flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono-telemetry text-[10px] text-[#bacac7]">
                <span className="uppercase">CURRENT TARGET CONTOUR</span>
                <span className="text-[#62f9ee]">CONFIDENCE 98.4%</span>
              </div>
              <h4 className="font-space text-lg text-white font-bold leading-tight">
                Alps & Po Valley Basin
              </h4>
              <div className="flex items-center gap-4 text-[#bacac7] font-mono-telemetry text-[11px] mt-0.5">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cloud</span> 14% Cover
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">wb_sunny</span> 38° Sun El
                </span>
                <span className="text-[#62f9ee] font-medium">VIS 120km</span>
              </div>
            </div>

            {/* Approaching Targets */}
            <div className="flex flex-col gap-1.5 font-sans text-xs">
              <span className="font-mono-telemetry text-[10px] uppercase text-[#bacac7]">
                APPROACHING FLIGHT PATH
              </span>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#272a34]/60 border border-[#272a34]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#ffba27]">near_me</span>
                  <span className="text-white">Aegean Sea & Greek Archipelago</span>
                </div>
                <span className="text-[#ffba27] font-mono-telemetry text-xs font-semibold tabular-nums">
                  IN 4m 12s
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#181b25] border border-[#272a34]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#e1b6ff]">nights_stay</span>
                  <span className="text-white">S. Auroral Belt Visibility (+48° Lat)</span>
                </div>
                <span className="text-[#e1b6ff] font-mono-telemetry text-xs font-semibold tabular-nums">
                  KP 2.33
                </span>
              </div>
            </div>

            {/* Space-to-Ground Comm */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#181b25] border border-[#272a34]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#62f9ee]">graphic_eq</span>
                <div className="flex flex-col">
                  <span className="font-sans text-xs text-white font-medium">Space-to-Ground Comm</span>
                  <span className="font-mono-telemetry text-[9px] text-[#bacac7]">
                    HOUSTON CAPCOM // EXPEDITION 73
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCarrierAudioActive(!carrierAudioActive)}
                className={`px-3 py-1 rounded-lg font-mono-telemetry text-[10px] uppercase transition cursor-pointer ${
                  carrierAudioActive ? 'bg-[#272a34] text-[#62f9ee] font-bold' : 'bg-[#181b25] text-[#bacac7]'
                }`}
              >
                {carrierAudioActive ? 'CARRIER ACTIVE' : 'MUTED'}
              </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleTakeSnapshot}
                className="px-3 py-2 rounded-xl bg-[#62f9ee] text-[#00716b] font-bold font-sans text-xs flex items-center justify-center gap-1.5 hover:shadow-lg transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                <span>{snapshotFeedback || 'Snapshot 4K'}</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Frame pinned to Expedition 73 Daily Sightings Feed.')}
                className="px-3 py-2 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-sans text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#3c4948]/30"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Pin to Feed</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Geographic coordinates locked onto target area.')}
                className="px-3 py-1.5 rounded-xl bg-[#181b25] hover:bg-[#272a34] text-[#bacac7] hover:text-white font-mono-telemetry text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#272a34]"
              >
                <span className="material-symbols-outlined text-[15px]">pin_drop</span>
                <span>Mark Hotspot</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Downloading 4K Raw FITS/TIFF Sensor Stack (124MB)...')}
                className="px-3 py-1.5 rounded-xl bg-[#181b25] hover:bg-[#272a34] text-[#bacac7] hover:text-white font-mono-telemetry text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#272a34]"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Raw FITS/TIFF</span>
              </button>
            </div>
          </div>
        </div>

        {/* LAYER 4: BOTTOM TIMELINE & COMM TRACK STRIP */}
        <div className="relative z-30 w-full px-4 sm:px-6 pb-3">
          <div className="w-full bg-[#0b0e17]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-[#3c4948]/30 shadow-xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono-telemetry text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[#62f9ee]">
                  <span className="material-symbols-outlined text-[15px]">radar</span>
                  <span>ORBITAL REVOLUTION #63,892</span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-[#bacac7]">
                  <span>ACTIVE GROUND STATION:</span>
                  <span className="text-white">MUNICH GS (ELEVATION 44°)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 tabular-nums">
                <span className="text-[#bacac7]">ORBIT PERIOD: 92m 48s</span>
                <span className="text-white font-bold">UTC: {currentTimeStr}</span>
              </div>
            </div>

            {/* Timeline Bar */}
            <div className="relative w-full h-3 bg-[#32343f] rounded-full overflow-hidden flex items-center">
              <div className="h-full bg-gradient-to-r from-[#3cdcd1]/40 via-[#62f9ee]/60 to-[#ffba27]/70 w-[58%]" />
              <div className="h-full bg-[#0b0e17] w-[42%] flex items-center justify-around opacity-75">
                <span className="w-1 h-1 rounded-full bg-[#e1b6ff]/50" />
                <span className="w-1 h-1 rounded-full bg-[#e1b6ff]/50" />
                <span className="w-1 h-1 rounded-full bg-[#e1b6ff]/50" />
              </div>
              <div className="absolute left-[58%] top-0 bottom-0 w-0.5 bg-[#ffb4ab] shadow-[0_0_8px_#ffb4ab]" />
              <div className="absolute left-[39%] -top-1 -bottom-1 w-3 bg-white rounded-full shadow-[0_0_12px_#ffffff] border border-[#0b0e17] transform -translate-x-1/2 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#0b0e17]" />
              </div>
            </div>

            <div className="flex justify-between items-center font-mono-telemetry text-[10px] text-[#bacac7] pt-0.5">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#ffba27]">light_mode</span>
                <span>DAYLIGHT ENTRY (PACIFIC SUNRISE)</span>
              </span>
              <span className="text-[#ffb4ab] font-medium">TERMINATOR BOUNDARY (-18m 42s)</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#e1b6ff]">dark_mode</span>
                <span>ORBITAL NIGHT (INDIAN OCEAN ECLIPSE)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECONDARY CUPOLA GEOSPATIAL ARCHIVES & MOSAIC SECTION */}
      {/* ========================================================= */}
      <div className="w-full px-4 sm:px-6 py-10 flex flex-col gap-6 bg-[#0b0e17] border-t border-[#272a34]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="font-mono-telemetry text-xs text-[#62f9ee] uppercase tracking-widest">
              // EXPEDITION 73 DIRECT TELEMETRY LOG
            </span>
            <h2 className="font-space text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cupola Geospatial Archives & Planetary Dynamics
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono-telemetry text-xs text-[#bacac7]">
            <span>ARCHIVE LINK: DSS-63 MADRID</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
            <span className="text-[#62f9ee]">SYNCHRONIZED</span>
          </div>
        </div>

        {/* Telemetry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Atmospheric Cloud Stratification Graph */}
          <div className="bg-[#181b25] p-6 rounded-2xl border border-[#272a34] flex flex-col justify-between gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#62f9ee]">air</span>
                <span className="font-space text-lg font-semibold text-white">Atmospheric Scattering</span>
              </div>
              <span className="font-mono-telemetry text-xs text-[#3cdcd1] tabular-nums">RAYLEIGH COEFF</span>
            </div>

            <div className="w-full h-32 flex items-end">
              <svg className="w-full h-full" fill="none" viewBox="0 0 300 100">
                <path d="M 0 85 Q 50 80 100 55 T 200 45 T 300 15" stroke="#62f9ee" strokeWidth="2.5" />
                <path d="M 0 85 Q 50 80 100 55 T 200 45 T 300 15 L 300 100 L 0 100 Z" fill="#62f9ee" fillOpacity="0.1" />
                <circle cx="100" cy="55" r="4" fill="#62f9ee" />
                <circle cx="200" cy="45" r="4" fill="#e1b6ff" />
                <circle cx="300" cy="15" r="4" fill="#ffdea9" />
              </svg>
            </div>

            <div className="flex items-center justify-between font-mono-telemetry text-xs pt-1 border-t border-[#272a34]">
              <div className="flex flex-col">
                <span className="text-[#bacac7] text-[10px]">TROPOPAUSE HT</span>
                <span className="text-white font-bold">14.2 KM</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[#bacac7] text-[10px]">AEROSOL OPTICAL</span>
                <span className="text-[#62f9ee] font-bold">0.118 AOD</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quartz Window Health Diagnostics */}
          <div className="bg-[#181b25] p-6 rounded-2xl border border-[#272a34] flex flex-col justify-between gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#e1b6ff]">lens_blur</span>
                <span className="font-space text-lg font-semibold text-white">Quartz Window Health</span>
              </div>
              <span className="font-mono-telemetry text-xs text-[#e1b6ff] uppercase">PANES 1-7 OK</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 py-2">
              {[
                { label: 'W1', height: '98%' },
                { label: 'W2', height: '96%' },
                { label: 'TOP', height: '100%', isTop: true },
                { label: 'W4', height: '94%' },
                { label: 'W5', height: '95%' },
                { label: 'W6', height: '99%' },
                { label: 'W7', height: '97%' }
              ].map((pane, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full h-16 rounded-lg bg-[#272a34] flex flex-col justify-end p-1">
                    <div className="w-full bg-[#62f9ee] rounded-sm" style={{ height: pane.height }} />
                  </div>
                  <span className={`font-mono-telemetry text-[10px] ${pane.isTop ? 'text-white font-bold' : 'text-[#bacac7]'}`}>
                    {pane.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between font-mono-telemetry text-xs pt-1 border-t border-[#272a34]">
              <div className="flex flex-col">
                <span className="text-[#bacac7] text-[10px]">TEMP EXTERNAL</span>
                <span className="text-white font-bold">+112°C SUN / -157°C SHADOW</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[#bacac7] text-[10px]">DEFOG HEATER</span>
                <span className="text-[#e1b6ff] font-bold">AUTO ENGAGED</span>
              </div>
            </div>
          </div>

          {/* Card 3: Planned Captures Queue */}
          <div className="bg-[#181b25] p-6 rounded-2xl border border-[#272a34] flex flex-col justify-between gap-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#ffba27]">photo_library</span>
                <span className="font-space text-lg font-semibold text-white">Planned Captures</span>
              </div>
              <span className="font-mono-telemetry text-xs text-[#ffba27] uppercase">QUEUE: 3 PENDING</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0b0e17] font-sans text-xs border border-[#272a34]">
                <span className="text-white">Nile River Delta Nocturnal City Grid</span>
                <span className="font-mono-telemetry text-[11px] text-[#62f9ee]">T-22m</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0b0e17] font-sans text-xs border border-[#272a34]">
                <span className="text-white">Himalayan Peak Shadow Projection</span>
                <span className="font-mono-telemetry text-[11px] text-[#bacac7]">T-1h 14m</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0b0e17] font-sans text-xs border border-[#272a34]">
                <span className="text-white">Aurora Australis Ring Filament</span>
                <span className="font-mono-telemetry text-[11px] text-[#bacac7]">T-1h 58m</span>
              </div>
            </div>

            <div className="flex items-center justify-between font-mono-telemetry text-xs pt-1 border-t border-[#272a34]">
              <div className="flex flex-col">
                <span className="text-[#bacac7] text-[10px]">BUFFER REPOSITORY</span>
                <span className="text-white font-bold">1.42 TB / 4.0 TB</span>
              </div>
              <button
                type="button"
                onClick={() => alert('Cosmic Codex synced with 3 newly scheduled captures.')}
                className="px-3 py-1 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white transition font-mono-telemetry text-xs uppercase cursor-pointer border border-[#3c4948]/30"
              >
                SYNC CODEX
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
