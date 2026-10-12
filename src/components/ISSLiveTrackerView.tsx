import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ISSLiveTrackerViewProps {
  onNavigateToScreen: (screenId: string) => void;
  currentTimeStr: string;
}

export const ISSLiveTrackerView: React.FC<ISSLiveTrackerViewProps> = ({
  onNavigateToScreen,
  currentTimeStr
}) => {
  const [orbitTrackChecked, setOrbitTrackChecked] = useState(true);
  const [terminatorChecked, setTerminatorChecked] = useState(true);
  const [dsnStationsChecked, setDsnStationsChecked] = useState(true);
  const [footprintChecked, setFootprintChecked] = useState(true);
  const [starfieldChecked, setStarfieldChecked] = useState(true);

  // Countdown timer for primary visible pass
  const [countdownSeconds, setCountdownSeconds] = useState(822); // 13m 42s
  const [isAlertSet, setIsAlertSet] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 822));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `T - ${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Three.js Earth Geocentric Orbit Simulation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070913, 0.0008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 12, 38);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x1a2138, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 3.4);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const blueRim = new THREE.PointLight(0x66fcf1, 2.8, 100);
    blueRim.position.set(-30, -15, -20);
    scene.add(blueRim);

    // Starfield Background
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    const colCyan = new THREE.Color(0x66fcf1);
    const colPurple = new THREE.Color(0xc77dff);
    const colWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 200 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i3 + 2] = r * Math.cos(phi);

      const rnd = Math.random();
      const c = rnd < 0.25 ? colCyan : rnd < 0.45 ? colPurple : colWhite;
      starCols[i3] = c.r;
      starCols[i3 + 1] = c.g;
      starCols[i3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Earth Globe
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    function generateEarthTexture() {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(cvs);

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#0a1d37');
      grad.addColorStop(0.5, '#102a43');
      grad.addColorStop(1, '#061325');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = '#1f4a38';
      for (let i = 0; i < 65; i++) {
        ctx.beginPath();
        const x = Math.random() * 1024;
        const y = 80 + Math.random() * 350;
        ctx.arc(x, y, 30 + Math.random() * 70, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(102, 252, 241, 0.45)';
      for (let i = 0; i < 180; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1024, 100 + Math.random() * 300, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * 1024, 60 + Math.random() * 380, 90 + Math.random() * 130, 12 + Math.random() * 22, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(cvs);
    }

    const earthGeo = new THREE.SphereGeometry(9, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: generateEarthTexture(),
      shininess: 30,
      specular: new THREE.Color(0x224466)
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Haze
    const atmosGeo = new THREE.SphereGeometry(9.45, 48, 48);
    const atmosMat = new THREE.MeshLambertMaterial({
      color: 0x66fcf1,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // Day/Night Terminator Mesh
    const nightGeo = new THREE.SphereGeometry(9.05, 32, 32);
    const nightMat = new THREE.MeshBasicMaterial({ color: 0x05070d, transparent: true, opacity: 0.45 });
    const nightHemisphere = new THREE.Mesh(nightGeo, nightMat);
    nightHemisphere.rotation.y = Math.PI / 1.6;
    earthGroup.add(nightHemisphere);

    // Ground Stations
    const stationsGroup = new THREE.Group();
    earthGroup.add(stationsGroup);

    const groundStations = [
      { name: 'Goldstone DSS-14', lat: 35.42, lon: -116.89, color: 0x66fcf1 },
      { name: 'Madrid DSN-63', lat: 40.42, lon: -4.25, color: 0x66fcf1 },
      { name: 'Canberra DSS-43', lat: -35.4, lon: 148.98, color: 0x66fcf1 },
      { name: 'Houston Mission Control', lat: 29.56, lon: -95.09, color: 0xffd166 },
      { name: 'Munich GS', lat: 48.13, lon: 11.58, color: 0x66fcf1 }
    ];

    groundStations.forEach((st) => {
      const phi = (90 - st.lat) * (Math.PI / 180);
      const theta = (st.lon + 180) * (Math.PI / 180);
      const r = 9.1;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({ color: st.color });
      const pin = new THREE.Mesh(pGeo, pMat);
      pin.position.set(x, y, z);

      const ringGeo = new THREE.RingGeometry(0.25, 0.45, 18);
      const ringMat = new THREE.MeshBasicMaterial({ color: st.color, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
      const beacon = new THREE.Mesh(ringGeo, ringMat);
      beacon.position.set(x * 1.01, y * 1.01, z * 1.01);
      beacon.lookAt(0, 0, 0);
      pin.add(beacon);

      stationsGroup.add(pin);
    });

    // ISS Orbit Track (51.64 degrees inclination)
    const orbitInclination = 51.64 * (Math.PI / 180);
    const orbitRadius = 12.2;
    const segments = 180;
    const orbitCurvePoints = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x0 = orbitRadius * Math.cos(theta);
      const z0 = orbitRadius * Math.sin(theta);
      const x = x0;
      const y = z0 * Math.sin(orbitInclination);
      const z = z0 * Math.cos(orbitInclination);
      orbitCurvePoints.push(new THREE.Vector3(x, y, z));
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitCurvePoints);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x66fcf1, transparent: true, opacity: 0.65, linewidth: 2 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Footprint cone
    const footprintGeo = new THREE.RingGeometry(1.6, 2.2, 32);
    const footprintMat = new THREE.MeshBasicMaterial({ color: 0x66fcf1, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const footprintMesh = new THREE.Mesh(footprintGeo, footprintMat);
    scene.add(footprintMesh);

    // ISS 3D Model
    const issModel = new THREE.Group();
    scene.add(issModel);

    const trussGeo = new THREE.BoxGeometry(4.2, 0.18, 0.18);
    const trussMat = new THREE.MeshPhongMaterial({ color: 0xd8d8d8 });
    const mainTruss = new THREE.Mesh(trussGeo, trussMat);
    issModel.add(mainTruss);

    const habGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.6, 16);
    const habMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const habModule = new THREE.Mesh(habGeo, habMat);
    habModule.rotation.x = Math.PI / 2;
    issModel.add(habModule);

    // Solar Wings
    const wingMat = new THREE.MeshLambertMaterial({ color: 0xd49b29, side: THREE.DoubleSide });
    function createWing(x: number, z: number) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.8), wingMat);
      p.position.set(x, 0, z);
      return p;
    }
    issModel.add(createWing(1.8, 1.1));
    issModel.add(createWing(1.8, -1.1));
    issModel.add(createWing(-1.8, 1.1));
    issModel.add(createWing(-1.8, -1.1));

    const issBeacon = new THREE.PointLight(0x66fcf1, 3.5, 12);
    issModel.add(issBeacon);

    // Animation & Controls
    let orbitAngle = 0.85;
    const orbitalSpeed = 0.0028;
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0;
    let rotY = 0;

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
        rotY += dx * 0.006;
        rotX += dy * 0.006;
        prevMouse = { x: e.clientX, y: e.clientY };
      } else {
        const mx = ((e.clientX - container.offsetLeft) / container.clientWidth) * 2 - 1;
        const my = -((e.clientY - container.offsetTop) / container.clientHeight) * 2 + 1;
        camera.position.x += (mx * 3.5 - camera.position.x) * 0.03;
        camera.position.y += (my * 2.5 + 12 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
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

      earthGroup.rotation.y += 0.001;
      earthGroup.rotation.y += (rotY - earthGroup.rotation.y) * 0.08;
      earthGroup.rotation.x += (rotX - earthGroup.rotation.x) * 0.08;

      orbitAngle += orbitalSpeed;
      const x0 = orbitRadius * Math.cos(orbitAngle);
      const z0 = orbitRadius * Math.sin(orbitAngle);
      const issX = x0;
      const issY = z0 * Math.sin(orbitInclination);
      const issZ = z0 * Math.cos(orbitInclination);

      issModel.position.set(issX, issY, issZ);
      issModel.lookAt(0, 0, 0);
      issModel.rotateY(Math.PI / 2);

      const norm = new THREE.Vector3(issX, issY, issZ).normalize().multiplyScalar(9.12);
      footprintMesh.position.copy(norm);
      footprintMesh.lookAt(0, 0, 0);

      const s = 1.0 + Math.sin(elapsed * 4) * 0.15;
      footprintMesh.scale.set(s, s, s);

      issBeacon.intensity = 2.0 + Math.sin(elapsed * 8) * 1.5;

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
  }, []);

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-7rem)] overflow-hidden select-none">
      {/* 3D Geocentric Orbit Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto z-0">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0b0e17] via-transparent to-[#0b0e17]/70 opacity-90" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0b0e17]/80 via-transparent to-[#0b0e17]/80" />
      </div>

      {/* Flight Deck UI Overlay */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full px-4 sm:px-6 py-4 gap-4 pointer-events-none">
        {/* TOP SECTION: Mission HUD Bar & Vector Badges */}
        <div className="flex flex-col gap-2.5 w-full pointer-events-auto">
          {/* Synchronization Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-2.5 rounded-2xl bg-[#0b0e17]/85 backdrop-blur-xl border border-[#3c4948]/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono-telemetry text-xs text-[#62f9ee]">
                <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-ping" />
                <span className="tracking-widest uppercase">
                  TLE ORBIT SYNC: EPOCH 2026.291 // DSN LOCK CONFIRMED
                </span>
              </div>
              <span className="text-[#3c4948] font-mono-telemetry hidden sm:inline">|</span>
              <div className="font-space text-sm text-[#e1b6ff] tracking-wider font-semibold">
                EXPEDITION 73 <span className="text-[#bacac7] font-mono-telemetry font-normal">// DAY 142.79</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono-telemetry text-xs">
              <div className="flex items-center gap-1.5 bg-[#272a34]/90 px-3 py-1 rounded-xl text-white border border-[#3c4948]/30">
                <span className="material-symbols-outlined text-[#62f9ee] text-[14px]">satellite_alt</span>
                <span className="text-[#bacac7]">NORAD ID:</span>
                <span className="text-white font-mono-telemetry font-bold">25544 (ISS)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#272a34]/90 px-3 py-1 rounded-xl text-[#62f9ee] border border-[#3c4948]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
                <span>EPS GRID: OPTIMAL</span>
              </div>
            </div>
          </div>

          {/* Telemetry Vector Pill Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Altitude (HAE)</span>
                <span className="material-symbols-outlined text-[13px] text-[#62f9ee]">height</span>
              </div>
              <div className="font-space text-lg text-white font-bold mt-0.5">
                418.4 <span className="font-mono-telemetry text-xs text-[#bacac7] font-normal">KM</span>
              </div>
              <div className="w-full bg-[#0b0e17] h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#62f9ee] h-full w-[84%]" />
              </div>
            </div>

            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Orbital Velocity</span>
                <span className="material-symbols-outlined text-[13px] text-[#62f9ee]">speed</span>
              </div>
              <div className="font-space text-lg text-white font-bold mt-0.5">
                27,612 <span className="font-mono-telemetry text-xs text-[#bacac7] font-normal">KM/H</span>
              </div>
              <div className="text-[#bacac7] font-mono-telemetry text-[10px]">7.67 KM/S VECTOR</div>
            </div>

            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Orbital Period</span>
                <span className="material-symbols-outlined text-[13px] text-[#62f9ee]">timelapse</span>
              </div>
              <div className="font-space text-lg text-white font-bold mt-0.5">
                92.89 <span className="font-mono-telemetry text-xs text-[#bacac7] font-normal">MIN</span>
              </div>
              <div className="text-[#bacac7] font-mono-telemetry text-[10px]">15.5 REVS / 24H</div>
            </div>

            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Inclination</span>
                <span className="material-symbols-outlined text-[13px] text-[#62f9ee]">explore</span>
              </div>
              <div className="font-space text-lg text-white font-bold mt-0.5">51.64°</div>
              <div className="text-[#bacac7] font-mono-telemetry text-[10px]">EQUATORIAL OFFSET</div>
            </div>

            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Ground Subpoint</span>
                <span className="material-symbols-outlined text-[13px] text-[#62f9ee]">my_location</span>
              </div>
              <div className="font-mono-telemetry text-xs text-[#62f9ee] font-bold mt-0.5 truncate">
                42.18° N, 18.45° E
              </div>
              <div className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase">ADRIATIC SEA REGION</div>
            </div>

            <div className="flex flex-col p-3 rounded-xl bg-[#1c1f29]/70 backdrop-blur-md border border-[#3c4948]/30 shadow-md col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase">
                <span>Solar Flux</span>
                <span className="material-symbols-outlined text-[13px] text-[#ffba27]">wb_sunny</span>
              </div>
              <div className="font-space text-lg text-[#ffba27] font-bold mt-0.5 flex items-center gap-1.5">
                <span>100%</span>
                <span className="font-mono-telemetry text-[10px] text-[#bacac7] font-normal uppercase">(SUNLIT)</span>
              </div>
              <div className="text-[#bacac7] font-mono-telemetry text-[10px]">BETA ANGLE +24.1°</div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Flanking Rails */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start my-auto">
          {/* LEFT RAIL: Predictions (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 pointer-events-auto">
            {/* Primary Pass Countdown */}
            <div className="flex flex-col p-6 rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl border border-[#3c4948]/40 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#62f9ee] text-[#00716b] font-mono-telemetry text-[10px] tracking-widest uppercase font-bold">
                  NEXT VISIBLE PASS
                </span>
                <div className="flex items-center gap-1.5 font-mono-telemetry text-xs text-[#bacac7]">
                  <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-pulse" />
                  <span>IN BOUND</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[#bacac7] font-mono-telemetry text-[10px] tracking-widest uppercase">
                  PRIMARY HORIZON TARGET
                </div>
                <div className="font-space text-2xl text-white font-bold tracking-tight">
                  Munich Ground Station
                </div>
                <div className="font-mono-telemetry text-xs text-[#62f9ee] mt-0.5">
                  MAX ELEVATION: 74° [ZENITH TRAJECTORY]
                </div>
              </div>

              {/* Huge Countdown */}
              <div className="my-4 p-4 rounded-xl bg-[#0b0e17]/85 border border-[#272a34] flex flex-col items-center justify-center">
                <div className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase tracking-widest">
                  SIGNAL ACQUISITION COUNTDOWN
                </div>
                <div className="font-space text-3xl sm:text-4xl font-bold text-[#62f9ee] font-mono-telemetry tracking-wider mt-1">
                  {formatCountdown(countdownSeconds)}
                </div>
                <div className="flex items-center gap-4 mt-2 font-mono-telemetry text-xs text-[#bacac7]">
                  <span>AOS: <strong className="text-white">18:55:54 UTC</strong></span>
                  <span>//</span>
                  <span>LOS: <strong className="text-white">19:06:12 UTC</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#272a34]/60 font-mono-telemetry text-xs border border-[#3c4948]/30">
                <div className="flex items-center gap-1.5 text-[#e1b6ff]">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span className="font-semibold tracking-wider">MAG -3.4 (EXTRA BRIGHT)</span>
                </div>
                <span className="text-[#bacac7] uppercase">NIGHT SKY CLEARED</span>
              </div>
            </div>

            {/* Passes List */}
            <div className="flex flex-col p-4 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-lg border border-[#3c4948]/30 shadow-lg gap-2">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase tracking-wider">
                <span>Upcoming European Passes</span>
                <span className="text-[#62f9ee] font-mono-telemetry">ORBIT 14,290 - 14,293</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0e17]/60 hover:bg-[#272a34] transition-colors border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#3cdcd1] text-[18px]">radar</span>
                  <div>
                    <div className="font-space text-xs font-semibold text-white">Paris Station (FR)</div>
                    <div className="font-mono-telemetry text-[10px] text-[#bacac7]">MAX ELEV: 62° // AZ: 240° WSW</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-telemetry text-xs text-white font-bold">20:31 UTC</div>
                  <div className="font-mono-telemetry text-[10px] text-[#e1b6ff]">DUR: 06m 22s</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0e17]/60 hover:bg-[#272a34] transition-colors border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#3cdcd1] text-[18px]">radar</span>
                  <div>
                    <div className="font-space text-xs font-semibold text-white">London Node (UK)</div>
                    <div className="font-mono-telemetry text-[10px] text-[#bacac7]">MAX ELEV: 48° // AZ: 215° SW</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-telemetry text-xs text-white font-bold">22:07 UTC</div>
                  <div className="font-mono-telemetry text-[10px] text-[#e1b6ff]">DUR: 05m 48s</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0e17]/60 hover:bg-[#272a34] transition-colors border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#3cdcd1] text-[18px]">radar</span>
                  <div>
                    <div className="font-space text-xs font-semibold text-white">Reykjavik (IS)</div>
                    <div className="font-mono-telemetry text-[10px] text-[#bacac7]">MAX ELEV: 31° // AZ: 190° S</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono-telemetry text-xs text-white font-bold">23:44 UTC</div>
                  <div className="font-mono-telemetry text-[10px] text-[#e1b6ff]">DUR: 04m 12s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-4 h-full pointer-events-none" />

          {/* RIGHT RAIL: ECLSS & Crew (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 pointer-events-auto">
            {/* ECLSS Card */}
            <div className="flex flex-col p-6 rounded-2xl bg-[#1c1f29]/80 backdrop-blur-xl border border-[#3c4948]/40 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono-telemetry text-xs text-[#bacac7] uppercase">
                  <span className="material-symbols-outlined text-[16px] text-[#62f9ee]">vital_signs</span>
                  <span>ECLSS CABIN TELEMETRY</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#691a9f] text-[#d69eff] font-mono-telemetry text-[10px] tracking-wider uppercase font-semibold">
                  ALL NOMINAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-3 rounded-xl bg-[#0b0e17]/80 border border-[#272a34] flex flex-col">
                  <span className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase">Cabin Pressure</span>
                  <span className="font-space text-lg text-white font-bold mt-0.5">
                    101.3 <span className="font-mono-telemetry text-xs text-[#bacac7] font-normal">kPa</span>
                  </span>
                  <span className="font-mono-telemetry text-[#62f9ee] text-[10px]">760.1 mmHg (SEA LEVEL)</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e17]/80 border border-[#272a34] flex flex-col">
                  <span className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase">Oxygen Level</span>
                  <span className="font-space text-lg text-white font-bold mt-0.5">21.2%</span>
                  <span className="font-mono-telemetry text-[#62f9ee] text-[10px]">CO2: 0.28 kPa (SAFE)</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e17]/80 border border-[#272a34] flex flex-col">
                  <span className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase">Internal Temp</span>
                  <span className="font-space text-lg text-white font-bold mt-0.5">22.4° C</span>
                  <span className="font-mono-telemetry text-[#bacac7] text-[10px]">HUMIDITY: 46% RH</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0e17]/80 border border-[#272a34] flex flex-col">
                  <span className="text-[#bacac7] font-mono-telemetry text-[10px] uppercase">Solar Wing Array</span>
                  <span className="font-space text-lg text-[#62f9ee] font-bold mt-0.5">
                    118.4 <span className="font-mono-telemetry text-xs text-[#bacac7] font-normal">kW</span>
                  </span>
                  <span className="font-mono-telemetry text-[#e1b6ff] text-[10px]">STORAGE: 98.4% CAP</span>
                </div>
              </div>
            </div>

            {/* Crew Complement */}
            <div className="flex flex-col p-4 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-lg border border-[#3c4948]/30 shadow-lg gap-2">
              <div className="flex items-center justify-between text-[#bacac7] font-mono-telemetry text-[10px] uppercase tracking-wider">
                <span>Expedition 73 Active Complement</span>
                <span className="text-[#62f9ee] font-mono-telemetry">4 ON-DUTY</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#272a34] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#32343f] flex items-center justify-center font-space text-xs text-white font-bold">
                      ER
                    </div>
                    <div>
                      <div className="font-sans text-xs text-white font-semibold">Cmdr. Dr. Elena Rostova</div>
                      <div className="font-mono-telemetry text-[10px] text-[#bacac7]">Astrophysics // EVA Lead</div>
                    </div>
                  </div>
                  <span className="font-mono-telemetry text-[10px] px-2 py-0.5 rounded bg-[#1c1f29] text-[#62f9ee]">
                    COMMAND
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#272a34] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#32343f] flex items-center justify-center font-space text-xs text-white font-bold">
                      MV
                    </div>
                    <div>
                      <div className="font-sans text-xs text-white font-semibold">FE Marcus Vance</div>
                      <div className="font-mono-telemetry text-[10px] text-[#bacac7]">Robotics // Canadarm2 Spec</div>
                    </div>
                  </div>
                  <span className="font-mono-telemetry text-[10px] px-2 py-0.5 rounded bg-[#1c1f29] text-[#bacac7]">
                    FLIGHT ENG
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#272a34] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#32343f] flex items-center justify-center font-space text-xs text-white font-bold">
                      KS
                    </div>
                    <div>
                      <div className="font-sans text-xs text-white font-semibold">FE Kenji Sato (JAXA)</div>
                      <div className="font-mono-telemetry text-[10px] text-[#bacac7]">Kibo Module Operations</div>
                    </div>
                  </div>
                  <span className="font-mono-telemetry text-[10px] px-2 py-0.5 rounded bg-[#1c1f29] text-[#bacac7]">
                    SCIENCE
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduled Spacewalk */}
            <div className="p-4 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-lg border border-[#3c4948]/30 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#691a9f]/50 border border-[#e1b6ff]/30 flex items-center justify-center text-[#e1b6ff] shrink-0">
                <span className="material-symbols-outlined text-[20px]">engineering</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono-telemetry text-[10px] text-[#e1b6ff] uppercase font-bold">
                  SCHEDULED SPACEWALK: US EVA 92
                </span>
                <span className="font-sans text-xs text-white">
                  Oct 24, 2026 // S6 Truss Cable Harness Deployment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COCKPIT & PIP DOWNLINK BAR */}
        <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-4 w-full pointer-events-auto pb-4">
          {/* Toggles Strip */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-[#0b0e17]/85 backdrop-blur-xl border border-[#3c4948]/40 shadow-2xl">
            <div className="flex items-center gap-1.5 px-1">
              <label className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272a34] text-[#62f9ee] cursor-pointer font-mono-telemetry text-[11px] hover:bg-[#32343f] transition-colors">
                <input
                  type="checkbox"
                  checked={orbitTrackChecked}
                  onChange={(e) => setOrbitTrackChecked(e.target.checked)}
                  className="accent-[#62f9ee] w-3.5 h-3.5 rounded"
                />
                <span>ORBIT TRACK</span>
              </label>

              <label className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272a34] text-[#62f9ee] cursor-pointer font-mono-telemetry text-[11px] hover:bg-[#32343f] transition-colors">
                <input
                  type="checkbox"
                  checked={terminatorChecked}
                  onChange={(e) => setTerminatorChecked(e.target.checked)}
                  className="accent-[#62f9ee] w-3.5 h-3.5 rounded"
                />
                <span>TERMINATOR</span>
              </label>

              <label className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272a34] text-[#62f9ee] cursor-pointer font-mono-telemetry text-[11px] hover:bg-[#32343f] transition-colors">
                <input
                  type="checkbox"
                  checked={dsnStationsChecked}
                  onChange={(e) => setDsnStationsChecked(e.target.checked)}
                  className="accent-[#62f9ee] w-3.5 h-3.5 rounded"
                />
                <span>DSN STATIONS</span>
              </label>

              <label className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272a34] text-[#62f9ee] cursor-pointer font-mono-telemetry text-[11px] hover:bg-[#32343f] transition-colors">
                <input
                  type="checkbox"
                  checked={footprintChecked}
                  onChange={(e) => setFootprintChecked(e.target.checked)}
                  className="accent-[#62f9ee] w-3.5 h-3.5 rounded"
                />
                <span>1000KM FOOTPRINT</span>
              </label>

              <label className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#272a34] text-[#62f9ee] cursor-pointer font-mono-telemetry text-[11px] hover:bg-[#32343f] transition-colors">
                <input
                  type="checkbox"
                  checked={starfieldChecked}
                  onChange={(e) => setStarfieldChecked(e.target.checked)}
                  className="accent-[#62f9ee] w-3.5 h-3.5 rounded"
                />
                <span>STARFIELD</span>
              </label>
            </div>

            <span className="text-[#3c4948] font-mono-telemetry">|</span>

            {/* Viewport Modes */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="px-3.5 py-1 rounded-xl bg-[#62f9ee] text-[#00716b] font-mono-telemetry text-[11px] font-bold shadow-sm"
              >
                3D GEOCENTRIC
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScreen('cupola-cam')}
                className="px-3.5 py-1 rounded-xl bg-[#1c1f29] hover:bg-[#272a34] text-[#bacac7] hover:text-white font-mono-telemetry text-[11px] transition-all cursor-pointer"
              >
                CUPOLA CAM
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScreen('cupola-cam')}
                className="hidden sm:inline-flex px-3.5 py-1 rounded-xl bg-[#1c1f29] hover:bg-[#272a34] text-[#bacac7] hover:text-white font-mono-telemetry text-[11px] transition-all cursor-pointer"
              >
                CANADARM2
              </button>
            </div>
          </div>

          {/* Right PiP & Quick Actions */}
          <div className="flex items-center gap-4">
            {/* Live Downlink PiP */}
            <div
              onClick={() => onNavigateToScreen('cupola-cam')}
              className="relative w-56 h-32 rounded-2xl overflow-hidden bg-[#0b0e17] border border-[#3c4948]/40 shadow-2xl flex flex-col justify-between p-2 cursor-pointer group"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByP62-I0WWV20Oc4JlrmxePT_QHLy13k-kyXupyBH7c0ji6hYKRb2jiggsZ8_PiZptW6tPBu4Wc48IGF0mFpTF9iXqiRzuVVGgXbgYnamyqmMu9jKE9KlnDCsXgdkw5gbaR3PrxYwGsSeqyYWvsG3gRHVIUxNrSAF5KS3Rof-G-C1q3UV9zfZj7FAnE3ugHzZW9gfCvkq50nML0PSSnELeUYO1dcNdJxHU9kIMNn3feSAifYDwhiA6XQ"
                alt="Live HDEV view"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#93000a]/80 text-[#ffdad6] font-mono-telemetry text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
                  <span>LIVE HDEV</span>
                </div>
                <span className="material-symbols-outlined text-white text-[16px] opacity-75 group-hover:scale-110 transition-transform">
                  open_in_full
                </span>
              </div>
              <div className="relative z-10 bg-[#0b0e17]/85 backdrop-blur-md px-2 py-0.5 rounded-md text-left font-mono-telemetry text-[10px] text-[#62f9ee]">
                NADIR SENSOR 04 // 1080p 60FPS
              </div>
            </div>

            {/* Quick Actions Array */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => alert('Exporting Expedition 73 TLE and state ephemeris vectors...')}
                className="px-4 py-1.5 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-space text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#3c4948]/30"
              >
                <span className="material-symbols-outlined text-[16px] text-[#62f9ee]">download</span>
                <span>Export Ephemeris</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAlertSet(true);
                  alert('Pass alert established: Notification scheduled for Munich ground acquisition (AOS 18:55:54 UTC)');
                }}
                className={`px-4 py-1.5 rounded-xl font-space text-xs font-semibold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isAlertSet
                    ? 'bg-[#691a9f] text-white'
                    : 'bg-[#62f9ee] text-[#00716b] hover:shadow-[0_0_16px_rgba(98,249,238,0.5)]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isAlertSet ? 'check_circle' : 'notifications_active'}
                </span>
                <span>{isAlertSet ? 'Alert Armed' : 'Set Pass Alert'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToScreen('cupola-cam')}
                className="px-4 py-1.5 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-[#e1b6ff] font-space text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#3c4948]/30"
              >
                <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                <span>Stereo VR Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
