import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CELESTIAL_DATA,
  CelestialBody,
  DEEP_SPACE_CONSTELLATIONS,
  DEEP_SPACE_DISTANCE_MARKERS,
  DistanceBeacon
} from '../data/spaceData';
import { StarChartOverlay } from './StarChartOverlay';
import confetti from 'canvas-confetti';

interface PlanetInspectorViewProps {
  onShareToFeed: (postTitle: string) => void;
  currentTimeStr: string;
}

export const PlanetInspectorView: React.FC<PlanetInspectorViewProps> = ({
  onShareToFeed,
  currentTimeStr
}) => {
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('earth');
  const [textureMap, setTextureMap] = useState<'topographic' | 'magnetosphere' | 'infrared'>('topographic');
  const [mode, setMode] = useState<'orrery' | 'inspector' | 'cartography'>('orrery');
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [showCoreCrossSection, setShowCoreCrossSection] = useState(false);
  const [showMagnetosphere, setShowMagnetosphere] = useState(true);
  const [showScaleGhost, setShowScaleGhost] = useState(false);
  const [showStarChart, setShowStarChart] = useState(false);
  const [cloudOpacity, setCloudOpacity] = useState(84);
  const [isSpinning, setIsSpinning] = useState(true);

  // Live viewport metrics
  const [zoomFactor, setZoomFactor] = useState(1.0);
  const [cameraAzimuth, setCameraAzimuth] = useState(142.84);
  const [cameraElevation, setCameraElevation] = useState(28.12);

  // Status feedback messages
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<{
    setPlanet: (key: string, mapType?: 'topographic' | 'magnetosphere' | 'infrared') => void;
    setTextureMap: (mapType: 'topographic' | 'magnetosphere' | 'infrared') => void;
    toggleAtmosphere: (enabled: boolean) => void;
    toggleInternalCore: (enabled: boolean) => void;
    toggleMagneticField: (enabled: boolean) => void;
    toggleStarChart: (enabled: boolean) => void;
    focusBeacon: (x: number, y: number, z: number) => void;
    toggleAutoRotate: (enabled: boolean) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetCamera: () => void;
  } | null>(null);

  const currentPlanet: CelestialBody = CELESTIAL_DATA[selectedPlanetKey] || CELESTIAL_DATA['earth'];

  // Three.js Interactive Space Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous canvas if any
    container.innerHTML = '';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080d, 0.0006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222639, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 3.2);
    sunLight.position.set(40, 20, 25);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x66fcf1, 2.5, 80);
    rimLight.position.set(-25, -10, -15);
    scene.add(rimLight);

    const purpleGlow = new THREE.PointLight(0xc77dff, 2.0, 70);
    purpleGlow.position.set(20, -15, -10);
    scene.add(purpleGlow);

    // Starfield
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const cCyan = new THREE.Color(0x66fcf1);
    const cPurple = new THREE.Color(0xc77dff);
    const cWhite = new THREE.Color(0xffffff);
    const cGold = new THREE.Color(0xffd166);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 180 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = r * Math.cos(phi);

      let chosenColor = cWhite;
      const rand = Math.random();
      if (rand < 0.25) chosenColor = cCyan;
      else if (rand < 0.45) chosenColor = cPurple;
      else if (rand < 0.6) chosenColor = cGold;

      starColors[i3] = chosenColor.r;
      starColors[i3 + 1] = chosenColor.g;
      starColors[i3 + 2] = chosenColor.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Planet Root Group
    const planetRoot = new THREE.Group();
    scene.add(planetRoot);

    // Procedural Planet Texture Generator with Multimodal Spectrum (Topographic, Magnetosphere, Infrared)
    function createPlanetTexture(type: string, mapMode: 'topographic' | 'magnetosphere' | 'infrared' = 'topographic') {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(cvs);

      // --- INFRARED THERMAL FLUX TEXTURE ---
      if (mapMode === 'infrared') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
        bgGrad.addColorStop(0, '#03001e');
        bgGrad.addColorStop(0.2, '#37003c');
        bgGrad.addColorStop(0.5, '#730040');
        bgGrad.addColorStop(0.8, '#37003c');
        bgGrad.addColorStop(1, '#03001e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 512);

        // Thermal convection bands & hot spots
        for (let y = 30; y < 490; y += 14) {
          const tempGrad = ctx.createLinearGradient(0, y, 1024, y);
          tempGrad.addColorStop(0, 'rgba(255, 18, 79, 0.25)');
          tempGrad.addColorStop(0.3, 'rgba(255, 110, 0, 0.45)');
          tempGrad.addColorStop(0.5, 'rgba(255, 230, 0, 0.65)');
          tempGrad.addColorStop(0.7, 'rgba(255, 110, 0, 0.45)');
          tempGrad.addColorStop(1, 'rgba(255, 18, 79, 0.25)');
          ctx.fillStyle = tempGrad;
          ctx.fillRect(0, y, 1024, 6);
        }

        // Active geothermal thermal anomalies
        for (let i = 0; i < 40; i++) {
          const cx = Math.random() * 1024;
          const cy = 60 + Math.random() * 390;
          const rad = 15 + Math.random() * 65;
          const heatRad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
          heatRad.addColorStop(0, '#ffffff');
          heatRad.addColorStop(0.3, '#ffea00');
          heatRad.addColorStop(0.6, '#ff0055');
          heatRad.addColorStop(0.85, '#79008f');
          heatRad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = heatRad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Infrared thermal contour lines
        ctx.strokeStyle = 'rgba(255, 220, 100, 0.35)';
        ctx.lineWidth = 1;
        for (let j = 0; j < 18; j++) {
          ctx.beginPath();
          const yBase = 50 + j * 24;
          ctx.moveTo(0, yBase);
          for (let x = 0; x <= 1024; x += 64) {
            ctx.lineTo(x, yBase + Math.sin(x * 0.02 + j) * 8);
          }
          ctx.stroke();
        }

        return new THREE.CanvasTexture(cvs);
      }

      // --- MAGNETOSPHERE DYNAMO FIELD TEXTURE ---
      if (mapMode === 'magnetosphere') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
        bgGrad.addColorStop(0, '#001427');
        bgGrad.addColorStop(0.5, '#07004d');
        bgGrad.addColorStop(1, '#001427');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 512);

        // Polar auroral caps & magnetic field induction rings
        const northAur = ctx.createRadialGradient(512, 40, 10, 512, 40, 220);
        northAur.addColorStop(0, '#62f9ee');
        northAur.addColorStop(0.4, '#00e5ff');
        northAur.addColorStop(0.7, '#7b2cbf');
        northAur.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = northAur;
        ctx.fillRect(0, 0, 1024, 140);

        const southAur = ctx.createRadialGradient(512, 472, 10, 512, 472, 220);
        southAur.addColorStop(0, '#62f9ee');
        southAur.addColorStop(0.4, '#00e5ff');
        southAur.addColorStop(0.7, '#7b2cbf');
        southAur.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = southAur;
        ctx.fillRect(0, 372, 1024, 140);

        // Magnetic dipole flux lines across the surface
        ctx.strokeStyle = 'rgba(98, 249, 238, 0.45)';
        ctx.lineWidth = 1.5;
        for (let step = 0; step < 16; step++) {
          ctx.beginPath();
          const xStart = 32 + step * 64;
          ctx.moveTo(xStart, 20);
          ctx.bezierCurveTo(
            xStart - 80, 256,
            xStart + 80, 256,
            xStart, 492
          );
          ctx.stroke();
        }

        // Gauss flux density iso-contours
        for (let k = 0; k < 25; k++) {
          ctx.fillStyle = 'rgba(225, 182, 255, 0.35)';
          ctx.beginPath();
          ctx.arc(Math.random() * 1024, 100 + Math.random() * 312, 8 + Math.random() * 25, 0, Math.PI * 2);
          ctx.fill();
        }

        return new THREE.CanvasTexture(cvs);
      }

      // --- TOPOGRAPHIC / NATURAL ELEVATION TEXTURE ---
      if (type === 'earth') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#0d2b45');
        grad.addColorStop(0.5, '#1d4e89');
        grad.addColorStop(1, '#001220');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // Landmasses
        ctx.fillStyle = '#208b3a';
        for (let i = 0; i < 50; i++) {
          ctx.beginPath();
          const cx = Math.random() * 1024;
          const cy = 90 + Math.random() * 330;
          ctx.arc(cx, cy, 35 + Math.random() * 70, 0, Math.PI * 2);
          ctx.fill();
        }
        // Deserts & mountain ridges
        ctx.fillStyle = '#c77d20';
        for (let i = 0; i < 25; i++) {
          ctx.beginPath();
          const cx = Math.random() * 1024;
          const cy = 120 + Math.random() * 200;
          ctx.arc(cx, cy, 20 + Math.random() * 45, 0, Math.PI * 2);
          ctx.fill();
        }
        // Swirling cloud systems
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        for (let i = 0; i < 35; i++) {
          ctx.beginPath();
          const cx = Math.random() * 1024;
          const cy = 60 + Math.random() * 380;
          ctx.ellipse(cx, cy, 80 + Math.random() * 130, 15 + Math.random() * 28, 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'mars') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#581808');
        grad.addColorStop(0.5, '#bf360c');
        grad.addColorStop(1, '#370617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
        ctx.fillStyle = '#ff7043';
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 1024, Math.random() * 512, 10 + Math.random() * 45, 0, Math.PI * 2);
          ctx.fill();
        }
        // Polar ice caps
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1024, 30);
        ctx.fillRect(0, 482, 1024, 30);
      } else if (type === 'jupiter') {
        for (let y = 0; y < 512; y += 12) {
          ctx.fillStyle = y % 24 === 0 ? '#bc6c25' : (y % 48 === 0 ? '#dda15e' : '#603808');
          ctx.fillRect(0, y, 1024, 12);
        }
        // Great red spot
        ctx.fillStyle = '#b7094c';
        ctx.beginPath();
        ctx.ellipse(650, 320, 75, 45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'saturn') {
        for (let y = 0; y < 512; y += 8) {
          ctx.fillStyle = y % 16 === 0 ? '#e0c097' : '#9d784a';
          ctx.fillRect(0, y, 1024, 8);
        }
      } else if (type === 'uranus') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#48cae4');
        grad.addColorStop(0.5, '#00b4d8');
        grad.addColorStop(1, '#0077b6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
      } else if (type === 'neptune') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#0077b6');
        grad.addColorStop(0.5, '#023e8a');
        grad.addColorStop(1, '#03045e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
        ctx.fillStyle = 'rgba(72, 202, 228, 0.4)';
        for (let i = 0; i < 20; i++) {
          ctx.fillRect(0, 80 + i * 18, 1024, 6);
        }
      } else if (type === 'mercury') {
        ctx.fillStyle = '#6c757d';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.fillStyle = '#495057';
        for (let i = 0; i < 100; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 1024, Math.random() * 512, 3 + Math.random() * 20, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === 'venus') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#d4a373');
        grad.addColorStop(0.5, '#e07a5f');
        grad.addColorStop(1, '#8d0801');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
      } else {
        // Europa
        ctx.fillStyle = '#dfe7fd';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 2;
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * 1024, Math.random() * 512);
          ctx.lineTo(Math.random() * 1024, Math.random() * 512);
          ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(cvs);
    }

    // Main Planet Mesh
    const planetGeo = new THREE.SphereGeometry(7, 64, 64);
    const planetMat = new THREE.MeshPhongMaterial({
      map: createPlanetTexture(selectedPlanetKey, textureMap),
      bumpScale: 0.12,
      shininess: 25,
      specular: new THREE.Color(0x334466)
    });
    const mainPlanetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetRoot.add(mainPlanetMesh);

    // Atmosphere Glow Layer
    const atmosGeo = new THREE.SphereGeometry(7.35, 48, 48);
    const atmosMat = new THREE.MeshLambertMaterial({
      color: 0x66fcf1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    planetRoot.add(atmosMesh);

    // Core Cross Section Group
    const coreGroup = new THREE.Group();
    const innerCoreGeo = new THREE.SphereGeometry(3.2, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCore);

    const mantleGeo = new THREE.SphereGeometry(5.2, 32, 32);
    const mantleMat = new THREE.MeshLambertMaterial({
      color: 0xff5722,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
    coreGroup.add(mantleMesh);
    coreGroup.visible = false;
    planetRoot.add(coreGroup);

    // Saturn Rings Mesh
    const ringGeo = new THREE.RingGeometry(9.5, 17.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd8b382,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    const ringsMesh = new THREE.Mesh(ringGeo, ringMat);
    ringsMesh.rotation.x = Math.PI / 2.3;
    ringsMesh.visible = selectedPlanetKey === 'saturn';
    planetRoot.add(ringsMesh);

    // Magnetic Field Lines Torus Group
    const magFieldGroup = new THREE.Group();
    for (let r = 9; r <= 15; r += 2) {
      const torusGeo = new THREE.TorusGeometry(r, 0.05, 16, 64);
      const torusMat = new THREE.MeshBasicMaterial({
        color: 0xc77dff,
        transparent: true,
        opacity: 0.4
      });
      const ringLine = new THREE.Mesh(torusGeo, torusMat);
      ringLine.rotation.y = (r - 9) * 0.2;
      magFieldGroup.add(ringLine);
    }
    magFieldGroup.visible = true;
    planetRoot.add(magFieldGroup);

    // ==========================================
    // DEEP SPACE STAR CHART & DISTANCE BEACONS 3D
    // ==========================================
    const starChartGroup = new THREE.Group();
    starChartGroup.visible = showStarChart;
    scene.add(starChartGroup);

    // Constellation lines & star nodes
    const constellationStarMat = new THREE.MeshBasicMaterial({ color: 0x62f9ee });
    const constellationLineMat = new THREE.LineBasicMaterial({
      color: 0x62f9ee,
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5
    });

    DEEP_SPACE_CONSTELLATIONS.forEach((c) => {
      const starPositions: THREE.Vector3[] = [];
      c.stars.forEach((s) => {
        const v = new THREE.Vector3(s.x, s.y, s.z);
        starPositions.push(v);

        // Star mesh node
        const nodeGeo = new THREE.SphereGeometry(1.2, 12, 12);
        const node = new THREE.Mesh(nodeGeo, constellationStarMat);
        node.position.copy(v);
        starChartGroup.add(node);

        // Subtle pulsing halo ring
        const haloGeo = new THREE.RingGeometry(1.5, 2.5, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xe1b6ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(v);
        halo.lookAt(0, 5, 30);
        starChartGroup.add(halo);
      });

      // Constellation Connecting Lines
      c.lines.forEach(([startIdx, endIdx]) => {
        if (starPositions[startIdx] && starPositions[endIdx]) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            starPositions[startIdx],
            starPositions[endIdx]
          ]);
          const line = new THREE.Line(lineGeo, constellationLineMat);
          starChartGroup.add(line);
        }
      });
    });

    // Distance Ladder Beacons (Pulsing marker rings with distance stems)
    const beaconGroup = new THREE.Group();
    starChartGroup.add(beaconGroup);

    DEEP_SPACE_DISTANCE_MARKERS.forEach((m) => {
      const bPos = new THREE.Vector3(m.x, m.y, m.z);
      // Distance marker pin
      const pGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffba27 });
      const pin = new THREE.Mesh(pGeo, pMat);
      pin.position.copy(bPos);
      beaconGroup.add(pin);

      // Light-year indicator ring
      const ringGeo = new THREE.RingGeometry(2.0, 3.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffba27,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(bPos);
      ring.lookAt(0, 5, 30);
      beaconGroup.add(ring);

      // Parallax coordinate guideline to ecliptic origin
      const guideGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        bPos
      ]);
      const guideLine = new THREE.Line(
        guideGeo,
        new THREE.LineDashedMaterial({
          color: 0x3cdcd1,
          dashSize: 3,
          gapSize: 4,
          transparent: true,
          opacity: 0.25
        })
      );
      guideLine.computeLineDistances();
      beaconGroup.add(guideLine);
    });

    // Hotspot Pins Group
    const hotspotsGroup = new THREE.Group();
    planetRoot.add(hotspotsGroup);

    function rebuildHotspots(key: string) {
      while (hotspotsGroup.children.length > 0) {
        hotspotsGroup.remove(hotspotsGroup.children[0]);
      }
      const p = CELESTIAL_DATA[key];
      if (!p || !p.hotspots) return;

      p.hotspots.forEach((hs) => {
        const phi = (90 - hs.lat) * (Math.PI / 180);
        const theta = (hs.lon + 180) * (Math.PI / 180);
        const r = 7.15;
        const x = -(r * Math.sin(phi) * Math.cos(theta));
        const z = r * Math.sin(phi) * Math.sin(theta);
        const y = r * Math.cos(phi);

        const pinGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0x66fcf1 });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(x, y, z);

        const beaconGeo = new THREE.RingGeometry(0.4, 0.65, 24);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0x66fcf1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x * 1.02, y * 1.02, z * 1.02);
        beacon.lookAt(0, 0, 0);
        pin.add(beacon);

        hotspotsGroup.add(pin);
      });
    }

    rebuildHotspots(selectedPlanetKey);

    // Interactive Mouse & Touch & Wheel Orbit Controls
    let isDragging = false;
    let prevPointerPos = { x: 0, y: 0 };
    let targetRotX = 0;
    let targetRotY = 0;
    let autoRotateEnabled = true;

    // Zoom & Distance State
    let currentDistance = 30; // base camera distance
    const minDistance = 12;
    const maxDistance = 75;

    const updateCameraDistance = (dist: number) => {
      currentDistance = Math.max(minDistance, Math.min(maxDistance, dist));
      const factor = (30 / currentDistance);
      setZoomFactor(parseFloat(factor.toFixed(2)));

      // Calculate camera position along its vector from origin
      const currentDir = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z).normalize();
      if (currentDir.lengthSq() < 0.001) currentDir.set(0, 0.16, 1).normalize();
      camera.position.copy(currentDir.multiplyScalar(currentDistance));
      camera.lookAt(0, 0, 0);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerPos = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!container) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const dx = clientX - prevPointerPos.x;
        const dy = clientY - prevPointerPos.y;
        targetRotY += dx * 0.008;
        targetRotX += dy * 0.008;

        // Clamp vertical pitch to prevent gimbal flip
        targetRotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotX));

        prevPointerPos = { x: clientX, y: clientY };

        // Update HUD live telemetry
        const azDeg = ((targetRotY * (180 / Math.PI)) % 360 + 360) % 360;
        const elDeg = targetRotX * (180 / Math.PI);
        setCameraAzimuth(parseFloat(azDeg.toFixed(2)));
        setCameraElevation(parseFloat(elDeg.toFixed(2)));
      } else if (!('touches' in e)) {
        // Subtle micro-parallax float
        const rect = container.getBoundingClientRect();
        const mx = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
        const my = -((clientY - rect.top) / container.clientHeight) * 2 + 1;
        camera.position.x += (mx * 2 - camera.position.x) * 0.02;
        camera.position.y += (my * 1.5 + 5 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      }
    };

    // Wheel Zoom handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.035;
      updateCameraDistance(currentDistance + zoomDelta);
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mousemove', handlePointerMove);

    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    container.addEventListener('wheel', handleWheel, { passive: false });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (autoRotateEnabled && !isDragging) {
        planetRoot.rotation.y += 0.0035;
      }

      planetRoot.rotation.y += (targetRotY - planetRoot.rotation.y) * 0.1;
      planetRoot.rotation.x += (targetRotX - planetRoot.rotation.x) * 0.1;

      starField.rotation.y = time * 0.0008;
      starField.rotation.x = time * 0.0004;

      hotspotsGroup.children.forEach((pin) => {
        if (pin.children[0]) {
          const s = 1.0 + Math.sin(time * 4) * 0.15;
          pin.children[0].scale.set(s, s, s);
        }
      });

      if (coreGroup.visible) {
        innerCore.scale.setScalar(1.0 + Math.sin(time * 6) * 0.08);
        mantleMesh.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Store engine instance for React controls
    engineRef.current = {
      setPlanet: (key: string, mapType?: 'topographic' | 'magnetosphere' | 'infrared') => {
        const activeMap = mapType || textureMap;
        planetMat.map = createPlanetTexture(key, activeMap);
        planetMat.needsUpdate = true;
        ringsMesh.visible = key === 'saturn';
        rebuildHotspots(key);

        const pData = CELESTIAL_DATA[key];
        if (pData) {
          atmosMat.color.setHex(pData.atmosHex);
        }

        planetRoot.scale.set(0.9, 0.9, 0.9);
        setTimeout(() => planetRoot.scale.set(1.0, 1.0, 1.0), 250);
      },
      setTextureMap: (mapType: 'topographic' | 'magnetosphere' | 'infrared') => {
        planetMat.map = createPlanetTexture(selectedPlanetKey, mapType);
        planetMat.needsUpdate = true;
      },
      toggleAtmosphere: (enabled: boolean) => {
        atmosMesh.visible = enabled;
      },
      toggleInternalCore: (enabled: boolean) => {
        coreGroup.visible = enabled;
        planetMat.wireframe = enabled;
      },
      toggleMagneticField: (enabled: boolean) => {
        magFieldGroup.visible = enabled;
      },
      toggleStarChart: (enabled: boolean) => {
        starChartGroup.visible = enabled;
      },
      focusBeacon: (x: number, y: number, z: number) => {
        camera.position.set(x * 0.2, y * 0.2 + 8, z * 0.2 + 25);
        camera.lookAt(x * 0.5, y * 0.5, z * 0.5);
      },
      toggleAutoRotate: (enabled: boolean) => {
        autoRotateEnabled = enabled;
      },
      zoomIn: () => {
        updateCameraDistance(currentDistance - 5);
      },
      zoomOut: () => {
        updateCameraDistance(currentDistance + 5);
      },
      resetCamera: () => {
        currentDistance = 30;
        camera.position.set(0, 5, 30);
        camera.lookAt(0, 0, 0);
        targetRotX = 0;
        targetRotY = 0;
        planetRoot.rotation.set(0, 0, 0);
        setZoomFactor(1.0);
        setCameraAzimuth(142.84);
        setCameraElevation(28.12);
      }
    };

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [selectedPlanetKey]);

  // Handle Planet Selection
  const handleSelectPlanet = (planetKey: string) => {
    setSelectedPlanetKey(planetKey);
    if (engineRef.current) {
      engineRef.current.setPlanet(planetKey, textureMap);
    }
  };

  // Handle Texture Map Switch
  const handleSelectTextureMap = (mapMode: 'topographic' | 'magnetosphere' | 'infrared') => {
    setTextureMap(mapMode);
    if (engineRef.current) {
      engineRef.current.setTextureMap(mapMode);
    }
    const mapNames = {
      topographic: 'TOPOGRAPHIC (NATURAL ELEVATION)',
      magnetosphere: 'MAGNETOSPHERE (DYNAMO FLUX)',
      infrared: 'INFRARED (THERMAL EMISSION)'
    };
    setFeedbackMsg(`TEXTURE MAP SWITCHED: ${mapNames[mapMode]}`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Handle Layer Toggles
  const handleToggleAtmosphere = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAtmosphere(e.target.checked);
    if (engineRef.current) engineRef.current.toggleAtmosphere(e.target.checked);
  };

  const handleToggleCore = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCoreCrossSection(e.target.checked);
    if (engineRef.current) engineRef.current.toggleInternalCore(e.target.checked);
  };

  const handleToggleMagnetosphere = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowMagnetosphere(e.target.checked);
    if (engineRef.current) engineRef.current.toggleMagneticField(e.target.checked);
  };

  const handleToggleStarChart = (checked: boolean) => {
    setShowStarChart(checked);
    if (engineRef.current) engineRef.current.toggleStarChart(checked);
  };

  const handleFocusBeacon = (marker: DistanceBeacon) => {
    if (engineRef.current) {
      engineRef.current.focusBeacon(marker.x, marker.y, marker.z);
    }
  };

  const handleToggleSpin = () => {
    const nextSpin = !isSpinning;
    setIsSpinning(nextSpin);
    if (engineRef.current) engineRef.current.toggleAutoRotate(nextSpin);
  };

  const handleResetCamera = () => {
    if (engineRef.current) {
      engineRef.current.resetCamera();
      setFeedbackMsg('CAMERA RECENTERED TO ORIGIN (0, 0, 0)');
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const handleZoomIn = () => {
    if (engineRef.current) engineRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (engineRef.current) engineRef.current.zoomOut();
  };

  const handleCaptureHologram = () => {
    setFeedbackMsg('RENDERING HOLO...');
    setTimeout(() => {
      setFeedbackMsg('HOLOGRAPHIC FRAME SAVED TO VAULT');
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#62f9ee', '#e1b6ff', '#ffffff']
      });
      setTimeout(() => setFeedbackMsg(null), 2500);
    }, 1000);
  };

  const handleExportData = () => {
    setFeedbackMsg('EPHEMERIS EXPORTED (JSON/CSV)');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleShare = () => {
    onShareToFeed(`${currentPlanet.name} Planetary Telemetry & Spectral Analysis`);
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-7rem)] overflow-hidden select-none">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 bg-[#0b0e17] overflow-hidden">
        {/* Nebular Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(98,249,238,0.08),rgba(11,14,23,0))] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_60%,rgba(225,182,255,0.05),rgba(11,14,23,0))] pointer-events-none" />

        {/* Reticle Targeters */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full pointer-events-none border border-[#3c4948]/20 animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-[#0b0e17]/80 font-mono-telemetry text-[11px] text-[#bacac7]/40">
            EPOCH J2000.0 EQUATORIAL
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-2 py-0.5 rounded bg-[#0b0e17]/80 font-mono-telemetry text-[11px] text-[#bacac7]/40">
            ECLIPTIC PLANE INCLINATION 0.00°
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[940px] h-[940px] rounded-full pointer-events-none border border-[#3c4948]/15" />

        {/* Crosshairs */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#3c4948]/15 pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#3c4948]/15 pointer-events-none" />

        {/* Canvas DOM node */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Foreground UI Overlay */}
      <div className="relative z-10 flex flex-col justify-between flex-1 w-full px-4 sm:px-6 pointer-events-none">
        {/* Top Overlay HUD */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 pointer-events-auto">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#1c1f29]/75 backdrop-blur-xl p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[#3c4948]/30">
            <button
              onClick={() => setMode('orrery')}
              className={`px-4 py-1.5 rounded-full font-mono-telemetry text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'orrery'
                  ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.4)]'
                  : 'text-[#bacac7] hover:text-white hover:bg-[#272a34]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mode === 'orrery' ? 'bg-[#00716b]' : 'bg-[#62f9ee]/40'}`} />
              Deep Space Orrery
            </button>
            <button
              onClick={() => setMode('inspector')}
              className={`px-4 py-1.5 rounded-full font-mono-telemetry text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'inspector'
                  ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.4)]'
                  : 'text-[#bacac7] hover:text-white hover:bg-[#272a34]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mode === 'inspector' ? 'bg-[#00716b]' : 'bg-[#62f9ee]/40'}`} />
              Planet Inspector
            </button>
            <button
              onClick={() => setMode('cartography')}
              className={`px-4 py-1.5 rounded-full font-mono-telemetry text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'cartography'
                  ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.4)]'
                  : 'text-[#bacac7] hover:text-white hover:bg-[#272a34]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${mode === 'cartography' ? 'bg-[#00716b]' : 'bg-[#e1b6ff]/40'}`} />
              Surface Cartography
            </button>
            <button
              onClick={() => handleToggleStarChart(!showStarChart)}
              className={`px-4 py-1.5 rounded-full font-mono-telemetry text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                showStarChart
                  ? 'bg-[#e1b6ff] text-[#4c007b] font-bold border-[#e1b6ff] shadow-[0_0_12px_rgba(225,182,255,0.4)]'
                  : 'text-[#bacac7] hover:text-white hover:bg-[#272a34] border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              <span>Star Chart</span>
            </button>
          </div>

          {/* Realtime Observatory Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-[#1c1f29]/75 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#3c4948]/30 shadow-md">
              <span className="material-symbols-outlined text-[15px] text-[#62f9ee]">speed</span>
              <span className="font-mono-telemetry text-xs text-[#bacac7]">ORBITAL VELOCITY:</span>
              <span className="font-mono-telemetry text-xs text-[#62f9ee] font-semibold tabular-nums">
                {currentPlanet.velocity}
              </span>
            </div>

            <div className="bg-[#1c1f29]/75 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#3c4948]/30 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-ping" />
              <span className="font-mono-telemetry text-xs text-[#bacac7]">DSN UPLINK:</span>
              <span className="font-mono-telemetry text-xs text-[#62f9ee] font-semibold tracking-wider">
                GOLDSTONE 34m (LOCKED)
              </span>
            </div>

            <div className="bg-[#1c1f29]/75 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#3c4948]/30 shadow-md">
              <span className="material-symbols-outlined text-[15px] text-[#ffba27]">schedule</span>
              <span className="font-mono-telemetry text-xs text-[#bacac7]">LOCAL SOLAR TIME:</span>
              <span className="font-mono-telemetry text-xs text-white font-semibold tabular-nums">
                {currentTimeStr}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Split Region: Left Deck & Right Science Panel */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 my-4 min-h-[500px]">
          {/* Left Inspector Control Deck */}
          <div className="w-full sm:w-72 bg-[#1c1f29]/80 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[#3c4948]/40 flex flex-col gap-4 pointer-events-auto">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-[#62f9ee]">tune</span>
                <span className="font-space text-lg text-white font-bold">Inspector Deck</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono-telemetry text-[10px] font-bold uppercase transition-all ${
                textureMap === 'infrared'
                  ? 'bg-[#ff0055]/20 text-[#ff7096] border border-[#ff0055]/40'
                  : textureMap === 'magnetosphere'
                  ? 'bg-[#62f9ee]/20 text-[#62f9ee] border border-[#62f9ee]/40'
                  : 'bg-[#272a34] text-[#bacac7]'
              }`}>
                {textureMap === 'infrared' ? 'INFRARED' : textureMap === 'magnetosphere' ? 'MAGNETO' : 'OPTICAL'}
              </span>
            </div>

            {/* Planetary Texture Map Dropdown Selector */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#141721]/90 border border-[#3c4948]/50 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#62f9ee]">texture</span>
                  <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase tracking-wider font-semibold">
                    Planetary Texture Map
                  </span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee] animate-pulse" />
              </div>

              <div className="relative mt-0.5">
                <select
                  value={textureMap}
                  onChange={(e) => handleSelectTextureMap(e.target.value as 'topographic' | 'magnetosphere' | 'infrared')}
                  className="w-full appearance-none bg-[#1d212d] hover:bg-[#252938] text-white text-xs font-mono-telemetry py-2 px-3 pr-8 rounded-lg border border-[#3c4948]/70 focus:border-[#62f9ee] focus:outline-none focus:ring-1 focus:ring-[#62f9ee] cursor-pointer transition-colors shadow-sm"
                >
                  <option value="topographic">🌍 Topographic (Natural & Elevation)</option>
                  <option value="magnetosphere">⚡ Magnetosphere (Dipole Dynamo)</option>
                  <option value="infrared">🔥 Infrared (Thermal Flux Emission)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#62f9ee]">
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Texture Map Spectral Description Pill */}
              <div className="flex items-center gap-1.5 mt-0.5 px-1 font-mono-telemetry text-[9px] text-[#859491]">
                <span className="material-symbols-outlined text-[12px] text-[#e1b6ff]">sensors</span>
                <span>
                  {textureMap === 'topographic' && 'Surface albedo, elevation ridges, biome gradients'}
                  {textureMap === 'magnetosphere' && 'Dipole lines, auroral oval rings, Gauss flux'}
                  {textureMap === 'infrared' && 'Mid-IR thermal anomalies, convection hot spots'}
                </span>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="flex flex-col gap-1.5">
              <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase tracking-wider">
                Atmospheric & Structural Layers
              </span>

              <label className="group flex items-center justify-between p-2 rounded-xl bg-[#181b25]/80 hover:bg-[#272a34] transition-all cursor-pointer border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#62f9ee]">cloud</span>
                  <span className="font-sans text-xs text-white">Atmosphere Haze</span>
                </div>
                <input
                  type="checkbox"
                  checked={showAtmosphere}
                  onChange={handleToggleAtmosphere}
                  className="w-4 h-4 rounded accent-[#62f9ee] cursor-pointer"
                />
              </label>

              <label className="group flex items-center justify-between p-2 rounded-xl bg-[#181b25]/80 hover:bg-[#272a34] transition-all cursor-pointer border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">layers</span>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-white">Internal Core Cross</span>
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">Cross-section 3D</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showCoreCrossSection}
                  onChange={handleToggleCore}
                  className="w-4 h-4 rounded accent-[#62f9ee] cursor-pointer"
                />
              </label>

              <label className="group flex items-center justify-between p-2 rounded-xl bg-[#181b25]/80 hover:bg-[#272a34] transition-all cursor-pointer border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#3cdcd1]">all_inclusive</span>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-white">Magnetosphere Flux</span>
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">Dipole Magnetic Lines</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showMagnetosphere}
                  onChange={handleToggleMagnetosphere}
                  className="w-4 h-4 rounded accent-[#62f9ee] cursor-pointer"
                />
              </label>

              <label className="group flex items-center justify-between p-2 rounded-xl bg-[#181b25]/80 hover:bg-[#272a34] transition-all cursor-pointer border border-[#272a34]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#ffba27]">aspect_ratio</span>
                  <span className="font-sans text-xs text-white">Earth 1:1 Scale Ghost</span>
                </div>
                <input
                  type="checkbox"
                  checked={showScaleGhost}
                  onChange={(e) => setShowScaleGhost(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#62f9ee] cursor-pointer"
                />
              </label>

              {/* Toggleable Deep Space Star Chart Overlay */}
              <label className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${
                showStarChart
                  ? 'bg-[#691a9f]/30 border-[#e1b6ff] shadow-[0_0_15px_rgba(225,182,255,0.25)]'
                  : 'bg-[#181b25]/90 hover:bg-[#272a34] border-[#3c4948]/50'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">auto_awesome</span>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs font-semibold text-white">Deep Space Star Chart</span>
                    <span className="font-mono-telemetry text-[9px] text-[#62f9ee]">Constellations & Light-Years</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showStarChart}
                  onChange={(e) => handleToggleStarChart(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#e1b6ff] cursor-pointer"
                />
              </label>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase">Cloud Opacity</span>
                <span className="font-mono-telemetry text-xs text-[#62f9ee] tabular-nums">{cloudOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cloudOpacity}
                onChange={(e) => setCloudOpacity(parseInt(e.target.value))}
                className="w-full h-1 bg-[#32343f] rounded-lg cursor-pointer accent-[#62f9ee]"
              />

              <div className="flex items-center justify-between mt-1">
                <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase">EM Band</span>
                <span className="font-mono-telemetry text-xs font-semibold" style={{
                  color: textureMap === 'infrared' ? '#ff7096' : textureMap === 'magnetosphere' ? '#62f9ee' : '#e1b6ff'
                }}>
                  {textureMap === 'topographic' && '540 nm (OPTICAL VISIBLE)'}
                  {textureMap === 'magnetosphere' && '0.1-100 kHz (VLF / DYNAMO)'}
                  {textureMap === 'infrared' && '3.8 - 12.5 µm (THERMAL IR)'}
                </span>
              </div>
              <div className={`h-2 rounded w-full transition-all ${
                textureMap === 'infrared'
                  ? 'bg-gradient-to-r from-[#240046] via-[#ff0055] to-[#ffea00] opacity-90'
                  : textureMap === 'magnetosphere'
                  ? 'bg-gradient-to-r from-[#001427] via-[#62f9ee] to-[#7b2cbf] opacity-90'
                  : 'bg-gradient-to-r from-[#691a9f] via-[#62f9ee] to-[#ffdea9] opacity-80'
              }`} />
            </div>

            {/* Actions & Zoom Controls */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSpin}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#272a34] hover:bg-[#363943] text-white font-mono-telemetry text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#3c4948]/30"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSpinning ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isSpinning ? 'HALT SPIN' : 'RESUME SPIN'}</span>
                </button>

                {/* Zoom In button */}
                <button
                  onClick={handleZoomIn}
                  title="Zoom In (or use mouse scroll wheel)"
                  className="w-9 h-9 rounded-xl bg-[#272a34] hover:bg-[#363943] text-[#62f9ee] font-mono-telemetry text-base flex items-center justify-center transition-colors cursor-pointer border border-[#3c4948]/30"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>

                {/* Zoom Out button */}
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out (or use mouse scroll wheel)"
                  className="w-9 h-9 rounded-xl bg-[#272a34] hover:bg-[#363943] text-[#62f9ee] font-mono-telemetry text-base flex items-center justify-center transition-colors cursor-pointer border border-[#3c4948]/30"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
              </div>

              {/* Reset to Origin Button */}
              <button
                onClick={handleResetCamera}
                title="Reset Camera Orientation & Recenter to Origin (0, 0, 0)"
                className="w-full py-2 px-3 rounded-xl bg-[#181b25] hover:bg-[#272a34] text-[#62f9ee] hover:text-white font-mono-telemetry text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#62f9ee]/40 shadow-sm hover:shadow-[0_0_12px_rgba(98,249,238,0.25)]"
              >
                <span className="material-symbols-outlined text-[16px]">filter_center_focus</span>
                <span>RESET TO ORIGIN</span>
              </button>
            </div>

            {/* Azimuth / Elevation / Zoom Readout */}
            <div className="bg-[#0b0e17]/80 p-2.5 rounded-xl border border-[#272a34] flex items-center justify-between font-mono-telemetry text-xs text-[#bacac7]">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#859491]">AZIMUTH</span>
                <span className="text-[#62f9ee] tabular-nums">{cameraAzimuth}°</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#859491]">ELEVATION</span>
                <span className="text-[#62f9ee] tabular-nums">
                  {cameraElevation >= 0 ? `+${cameraElevation}` : cameraElevation}°
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-[#859491]">FOV ZOOM</span>
                <span className="text-[#e1b6ff] tabular-nums">{zoomFactor}x</span>
              </div>
            </div>
          </div>

          {/* Right Floating Scientific Telemetry Sidebar */}
          <div className="w-full sm:w-80 lg:w-96 bg-[#1c1f29]/80 backdrop-blur-2xl rounded-2xl p-5 shadow-[0_16px_48px_rgba(0,0,0,0.65)] border border-[#3c4948]/40 flex flex-col gap-4 pointer-events-auto max-h-[calc(100vh-14rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#62f9ee]" />
                  <span className="font-mono-telemetry text-xs text-[#62f9ee] uppercase tracking-widest">
                    {currentPlanet.sector}
                  </span>
                </div>
                <h2 className="font-space text-2xl text-white tracking-tight font-bold mt-0.5">
                  {currentPlanet.name}
                </h2>
                <span className="font-mono-telemetry text-xs text-[#bacac7]">
                  {currentPlanet.classification}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-[#272a34] flex items-center justify-center text-[#62f9ee] shadow-[0_0_12px_rgba(98,249,238,0.2)]">
                <span className="material-symbols-outlined text-[24px]">public</span>
              </div>
            </div>

            {/* Astrodynamics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#181b25] p-2.5 rounded-xl border border-[#272a34] flex flex-col">
                <span className="font-mono-telemetry text-[10px] text-[#859491] uppercase">Mass (kg)</span>
                <span className="font-mono-telemetry text-xs text-white font-semibold mt-0.5">
                  {currentPlanet.mass}
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                  {currentPlanet.earthMass}
                </span>
              </div>

              <div className="bg-[#181b25] p-2.5 rounded-xl border border-[#272a34] flex flex-col">
                <span className="font-mono-telemetry text-[10px] text-[#859491] uppercase">Mean Radius</span>
                <span className="font-mono-telemetry text-xs text-white font-semibold mt-0.5">
                  {currentPlanet.radius}
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#62f9ee]">
                  {currentPlanet.equatRadius}
                </span>
              </div>

              <div className="bg-[#181b25] p-2.5 rounded-xl border border-[#272a34] flex flex-col">
                <span className="font-mono-telemetry text-[10px] text-[#859491] uppercase">Surface Temp</span>
                <span className="font-mono-telemetry text-xs text-[#ffba27] font-semibold mt-0.5">
                  {currentPlanet.temp}
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                  {currentPlanet.tempRange}
                </span>
              </div>

              <div className="bg-[#181b25] p-2.5 rounded-xl border border-[#272a34] flex flex-col">
                <span className="font-mono-telemetry text-[10px] text-[#859491] uppercase">Gravity</span>
                <span className="font-mono-telemetry text-xs text-white font-semibold mt-0.5">
                  {currentPlanet.gravity}
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                  {currentPlanet.gForce}
                </span>
              </div>

              <div className="col-span-2 bg-[#181b25] p-2.5 rounded-xl border border-[#272a34] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-mono-telemetry text-[10px] text-[#859491] uppercase">Orbital Period (Sidereal)</span>
                  <span className="font-mono-telemetry text-xs text-white font-semibold">
                    {currentPlanet.period}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono-telemetry text-[10px] text-[#62f9ee]">
                  <span className="material-symbols-outlined text-[14px]">rotate_right</span>
                  <span>{currentPlanet.axialTilt}</span>
                </div>
              </div>
            </div>

            {/* Atmospheric Composition */}
            <div className="flex flex-col gap-2 bg-[#181b25] p-3 rounded-xl border border-[#272a34]">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase tracking-wider">
                  Atmospheric Composition
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#62f9ee]">
                  101.3 kPa (1 atm)
                </span>
              </div>

              {/* Composition Stacked Bar */}
              <div className="h-2.5 w-full rounded-full bg-[#32343f] overflow-hidden flex">
                {currentPlanet.gases.map((gas, i) => (
                  <div
                    key={i}
                    className="h-full"
                    style={{
                      width: `${Math.max(gas.percentage, 3)}%`,
                      backgroundColor: gas.color
                    }}
                    title={`${gas.name} ${gas.val}`}
                  />
                ))}
              </div>

              {/* Values Breakdown */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 font-mono-telemetry text-xs">
                {currentPlanet.gases.map((gas, i) => (
                  <div key={i} className="flex items-center justify-between text-[#bacac7]">
                    <span className="flex items-center gap-1.5 text-white">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gas.color }} />
                      {gas.name}
                    </span>
                    <span className="font-semibold text-white">{gas.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspots */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase tracking-wider">
                  Surface Telemetry Hotspots
                </span>
                <span className="font-mono-telemetry text-[10px] text-[#62f9ee]">
                  {currentPlanet.hotspots.length} PINNED SENSORS
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {currentPlanet.hotspots.map((hs, i) => (
                  <button
                    key={i}
                    onClick={() => alert(`Locking camera target reticle onto ${hs.title} (${hs.desc}).`)}
                    className="text-left p-2.5 rounded-xl bg-[#181b25] hover:bg-[#272a34] transition-all flex items-center justify-between group border border-[#272a34] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-[#62f9ee] group-hover:scale-125 transition-transform">
                        my_location
                      </span>
                      <div className="flex flex-col">
                        <span className="font-space text-xs font-semibold text-white">
                          {hs.title}
                        </span>
                        <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                          {hs.desc}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono-telemetry text-[9px] bg-[#32343f] text-[#62f9ee] font-bold">
                      {hs.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Controls: Planetary Carousel + Action Bar */}
        <div className="flex flex-col gap-3 pb-6 pointer-events-auto">
          {feedbackMsg && (
            <div className="self-center px-4 py-1.5 rounded-full bg-[#62f9ee] text-[#00716b] font-mono-telemetry text-xs font-bold shadow-lg animate-bounce">
              {feedbackMsg}
            </div>
          )}

          {/* Carousel */}
          <div className="w-full overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-2.5 min-w-max px-1">
              {Object.keys(CELESTIAL_DATA).map((key) => {
                const planet = CELESTIAL_DATA[key];
                const isActive = selectedPlanetKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectPlanet(key)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl backdrop-blur-xl transition-all text-left cursor-pointer border ${
                      isActive
                        ? 'bg-[#1c1f29]/95 ring-1 ring-[#62f9ee] border-[#62f9ee]/60 shadow-[0_0_20px_rgba(98,249,238,0.35)]'
                        : 'bg-[#1c1f29]/70 hover:bg-[#272a34] border-[#3c4948]/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#272a34] flex items-center justify-center text-white font-mono-telemetry text-xs font-bold shadow-inner">
                      {planet.symbol}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-space text-xs font-semibold ${isActive ? 'text-[#62f9ee]' : 'text-white'}`}>
                        {planet.id.charAt(0).toUpperCase() + planet.id.slice(1)}
                      </span>
                      <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                        {planet.au}
                      </span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee] animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1c1f29]/80 backdrop-blur-2xl px-6 py-3 rounded-2xl shadow-xl border border-[#3c4948]/30">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCaptureHologram}
                className="px-4 py-2 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-space text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#3c4948]/40"
              >
                <span className="material-symbols-outlined text-[18px] text-[#62f9ee]">photo_camera</span>
                <span>Capture Hologram</span>
              </button>

              <button
                onClick={handleExportData}
                className="px-4 py-2 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-space text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-[#3c4948]/40"
              >
                <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">database</span>
                <span>Export Ephemeris (CSV/JSON)</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="hidden md:flex items-center gap-2 font-mono-telemetry text-xs text-[#bacac7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffba27]" />
                <span>FEED PROTOCOL v2.4</span>
              </div>

              <button
                onClick={handleShare}
                className="px-5 py-2 rounded-xl bg-[#62f9ee] text-[#00716b] font-space text-xs font-bold shadow-[0_0_16px_rgba(98,249,238,0.35)] hover:shadow-[0_0_24px_rgba(98,249,238,0.6)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span>Share to Sightings Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Space Star Chart Overlay */}
      <StarChartOverlay
        isVisible={showStarChart}
        onClose={() => handleToggleStarChart(false)}
        onFocusMarker={handleFocusBeacon}
      />
    </div>
  );
};
