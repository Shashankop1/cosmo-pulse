import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WarpIntroOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  destinationName?: string;
}

export const WarpIntroOverlay: React.FC<WarpIntroOverlayProps> = ({
  isOpen,
  onComplete,
  destinationName = 'TERRA-1 (1.00 AU)'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const velocityCounterRef = useRef<HTMLSpanElement | null>(null);
  const timerBadgeRef = useRef<HTMLSpanElement | null>(null);
  const telemetryTextRef = useRef<HTMLDivElement | null>(null);
  const stageTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cw = (canvas.width = window.innerWidth);
    let ch = (canvas.height = window.innerHeight);
    let cx = cw / 2;
    let cy = ch / 2;

    const handleResize = () => {
      if (!canvas) return;
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
      cx = cw / 2;
      cy = ch / 2;
    };
    window.addEventListener('resize', handleResize);

    const NUM_STARS = 700;
    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      color: string;
      size: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2200,
        y: (Math.random() - 0.5) * 2200,
        z: Math.random() * 1000 + 40,
        prevZ: 1000,
        color:
          Math.random() > 0.4
            ? '#66FCF1'
            : Math.random() > 0.5
            ? '#C77DFF'
            : '#FFFFFF',
        size: Math.random() * 2 + 1.2
      });
    }

    const WARP_DURATION = 2600; // ms
    let startTime: number | null = null;
    let animId: number;
    let completed = false;

    const render = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / WARP_DURATION, 1);

      // Accelerating curve
      const speed = 14 + Math.pow(progress, 3) * 115;

      ctx.fillStyle = 'rgba(7, 8, 13, 0.28)';
      ctx.fillRect(0, 0, cw, ch);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.prevZ = s.z;
        s.z -= speed;

        if (s.z <= 1) {
          s.z = 1000;
          s.prevZ = 1000;
          s.x = (Math.random() - 0.5) * cw * 1.8;
          s.y = (Math.random() - 0.5) * ch * 1.8;
        }

        const k = 420 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const prevK = 420 / s.prevZ;
        const prevPx = s.x * prevK + cx;
        const prevPy = s.y * prevK + cy;

        if (px >= 0 && px <= cw && py >= 0 && py <= ch) {
          const alpha = Math.min(1, (1000 - s.z) / 400);
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(0.6, (1 - s.z / 1000) * s.size * 2.2);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // Chromatic Reticle Crosshair
      ctx.strokeStyle = 'rgba(98, 249, 238, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy);
      ctx.lineTo(cx + 24, cy);
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx, cy + 24);
      ctx.stroke();

      // UI HUD DOM Updates
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${(progress * 100).toFixed(1)}%`;
      }

      if (velocityCounterRef.current) {
        velocityCounterRef.current.textContent =
          progress < 0.88
            ? `${(1.2 + Math.pow(progress, 2) * 8.67).toFixed(2)}c`
            : 'DECELERATING 0.00c';
      }

      if (timerBadgeRef.current) {
        const remaining = Math.max(0, (WARP_DURATION - elapsed) / 1000).toFixed(1);
        timerBadgeRef.current.textContent = `T-${remaining}s`;
      }

      if (telemetryTextRef.current) {
        if (progress < 0.25) {
          telemetryTextRef.current.textContent = 'INITIALIZING QUANTUM TELEMETRY...';
        } else if (progress < 0.55) {
          telemetryTextRef.current.textContent =
            'WARP VELOCITY: 9.87c // COMPRESSING SPACE-TIME';
        } else if (progress < 0.85) {
          telemetryTextRef.current.textContent = 'SYNCHRONIZING ORBITAL SENSORS...';
        } else {
          telemetryTextRef.current.textContent = 'COSMOPULSE PULSAR V2.4 ONLINE';
          if (stageTitleRef.current) {
            stageTitleRef.current.textContent = `DESTINATION REACHED: ${destinationName}`;
          }
        }
      }

      // Flash trigger near finish
      if (progress > 0.88 && flashRef.current) {
        flashRef.current.style.opacity = '0.9';
        setTimeout(() => {
          if (flashRef.current) flashRef.current.style.opacity = '0';
        }, 160);
      }

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else if (!completed) {
        completed = true;
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onComplete, destinationName]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07080d] select-none transition-opacity duration-700 ease-out overflow-hidden"
      id="cosmic-intro-overlay"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Atmospheric Nebular Shockwave Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(98,249,238,0.18)_0%,rgba(105,26,159,0.15)_40%,rgba(7,8,13,0.92)_85%)] pointer-events-none mix-blend-screen z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(225,182,255,0.12),transparent_70%)] pointer-events-none z-10" />

      {/* Flash element */}
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white pointer-events-none opacity-0 z-30 transition-opacity duration-300 ease-out"
      />

      {/* Target Reticles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] rounded-full border border-[#62f9ee]/30 pointer-events-none z-15 pulse-ring-anim" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[300px] h-[220px] sm:h-[300px] rounded-full border border-[#e1b6ff]/25 border-dashed animate-spin-slow pointer-events-none z-15" />

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-40">
        <button
          onClick={onComplete}
          className="group px-4 py-2 rounded-full bg-[#1c1f29]/80 hover:bg-[#272a34] border border-[#3c4948]/40 text-[#bacac7] hover:text-[#62f9ee] backdrop-blur-xl font-mono-telemetry text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] flex items-center gap-2 cursor-pointer"
        >
          <span>SKIP WARP INTRO</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
            fast_forward
          </span>
        </button>
      </div>

      {/* Top Telemetry Marker */}
      <div className="absolute top-6 left-6 z-40 hidden sm:flex items-center gap-3 font-mono-telemetry text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b0e17]/80 border border-[#62f9ee]/20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-ping" />
          <span className="text-[#62f9ee] tracking-widest">RELATIVISTIC JUMP ACTIVE</span>
        </div>
        <span
          ref={timerBadgeRef}
          className="text-[#bacac7] tabular-nums tracking-wider"
        >
          T-02.6s
        </span>
      </div>

      {/* Centerpiece Content */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-xl px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#62f9ee] blur-2xl opacity-40 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0b0e17]/90 border border-[#62f9ee]/50 flex items-center justify-center shadow-[0_0_35px_rgba(98,249,238,0.5)]">
            <img
              alt="CosmoPulse Emblem"
              className="w-12 h-12 object-contain animate-[pulse_2s_ease-in-out_infinite]"
              src="https://lh3.googleusercontent.com/aida/AEtjO1U6lEDXW7f3euLLmbdUtzwMsDKijSkJTVHL40u0SSR-jGbxyE-exsfhBSECN7kCFobn_msv3yJJx30w5RM6BIgc_cGXRoXF3w98nlaEJzBbb8_ScgJ1CoEYT3vyq08QHiOGfM4bwGT7n_JAhF42NA1f46Y2YpnY_ZHnClu98Ee9LgbDfTfZGop9JguTvovT_8Sl4Tbw-y5EHwiaCJLCLvKuKc1-e0L3ZZ_2AC681GGbUNC4K0KYRA1cWqUh"
            />
          </div>
        </div>

        <h1
          ref={stageTitleRef}
          className="font-space text-2xl sm:text-4xl text-white font-bold tracking-tight mb-2 drop-shadow-[0_0_24px_rgba(98,249,238,0.7)]"
        >
          COSMOPULSE WARP DRIVE
        </h1>

        <div
          ref={telemetryTextRef}
          className="h-6 flex items-center justify-center font-mono-telemetry text-xs sm:text-sm text-[#62f9ee] font-semibold tracking-wider uppercase mb-5"
        >
          CALCULATING TACHYON VECTOR...
        </div>

        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0b0e17]/80 border border-[#3c4948]/30 backdrop-blur-xl mb-6 shadow-inner font-mono-telemetry text-xs">
          <span className="text-[#bacac7] uppercase">WARP VELOCITY:</span>
          <span
            ref={velocityCounterRef}
            className="text-[#62f9ee] font-bold tracking-wider text-sm tabular-nums"
          >
            9.87c
          </span>
          <span className="text-[#e1b6ff]">(LIGHTSPEED × 9.87)</span>
        </div>

        <div className="w-64 sm:w-80 h-1.5 rounded-full bg-[#32343f]/60 overflow-hidden relative border border-[#3c4948]/30 mb-3">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#e1b6ff] via-[#62f9ee] to-[#3cdcd1] shadow-[0_0_16px_rgba(98,249,238,0.9)] transition-all duration-75 ease-linear"
            style={{ width: '5%' }}
          />
        </div>

        {/* Audio frequency wave simulation */}
        <div className="flex items-center gap-1 h-3 mt-1 opacity-70">
          <span className="w-1 h-2 rounded bg-[#62f9ee] animate-pulse" />
          <span className="w-1 h-3 rounded bg-[#62f9ee] animate-pulse" style={{ animationDelay: '0.1s' }} />
          <span className="w-1 h-1 rounded bg-[#e1b6ff] animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-3 rounded bg-[#62f9ee] animate-pulse" style={{ animationDelay: '0.15s' }} />
          <span className="w-1 h-2 rounded bg-[#62f9ee] animate-pulse" style={{ animationDelay: '0.25s' }} />
          <span className="w-1 h-3 rounded bg-[#e1b6ff] animate-pulse" style={{ animationDelay: '0.05s' }} />
          <span className="w-1 h-1.5 rounded bg-[#62f9ee] animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>

        <div className="mt-4 font-mono-telemetry text-[11px] text-[#bacac7]/70 tracking-widest uppercase">
          DESTINATION: SOLAR SYSTEM INNER DISK // {destinationName}
        </div>
      </div>
    </div>
  );
};
