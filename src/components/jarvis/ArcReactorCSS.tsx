"use client";

import { useEffect, useRef } from "react";

export function ArcReactorCSS() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const s = Math.min(window.innerWidth, window.innerHeight) * 0.7;
      canvas.width = s * dpr;
      canvas.height = s * dpr;
      canvas.style.width = s + "px";
      canvas.style.height = s + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { angle: number; r: number; speed: number; size: number; alpha: number; drift: number }[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({ angle: Math.random() * Math.PI * 2, r: 40 + Math.random() * 180, speed: 0.001 + Math.random() * 0.006, size: 0.4 + Math.random() * 2, alpha: 0.2 + Math.random() * 0.8, drift: (Math.random() - 0.5) * 0.02 });
    }

    let frame = 0;
    let raf: number;

    const draw = () => {
      frame++;
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      const baseR = Math.min(cx, cy) * 0.12;
      ctx.clearRect(0, 0, w, h);

      const pulse = 0.7 + 0.3 * Math.sin(frame * 0.015);

      // Wide ambient glow
      const ambGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 6);
      ambGrad.addColorStop(0, `rgba(77,227,255,${0.08 * pulse})`);
      ambGrad.addColorStop(0.3, `rgba(40,150,200,${0.04 * pulse})`);
      ambGrad.addColorStop(1, "rgba(2,6,13,0)");
      ctx.fillStyle = ambGrad;
      ctx.fillRect(0, 0, w, h);

      // Rings
      const rings = [
        { r: baseR * 1.0, width: 2.5, alpha: 1.0, speed: 0 },
        { r: baseR * 1.6, width: 1.8, alpha: 0.6, speed: 0.008 },
        { r: baseR * 2.2, width: 1.2, alpha: 0.4, speed: -0.004 },
        { r: baseR * 2.9, width: 1.5, alpha: 0.3, speed: 0.003 },
        { r: baseR * 3.6, width: 1.0, alpha: 0.2, speed: -0.002 },
        { r: baseR * 4.3, width: 0.8, alpha: 0.12, speed: 0.001 },
      ];

      rings.forEach((ring) => {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * ring.speed);
        ctx.beginPath(); ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(77,227,255,${ring.alpha * pulse})`;
        ctx.lineWidth = ring.width * dpr; ctx.stroke();

        if (ring.alpha > 0.2) {
          ctx.beginPath(); ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(77,227,255,${ring.alpha * 0.15 * pulse})`;
          ctx.lineWidth = (ring.width + 4) * dpr; ctx.stroke();
        }

        if (ring.r > baseR * 1.2) {
          const ticks = ring.r > baseR * 2.5 ? 48 : 24;
          for (let i = 0; i < ticks; i++) {
            const a = (i / ticks) * Math.PI * 2;
            const major = i % 4 === 0;
            const len = (major ? 8 : 2.5) * dpr;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * (ring.r - len), Math.sin(a) * (ring.r - len));
            ctx.lineTo(Math.cos(a) * (ring.r + len), Math.sin(a) * (ring.r + len));
            ctx.strokeStyle = `rgba(77,227,255,${ring.alpha * (major ? 0.6 : 0.2) * pulse})`;
            ctx.lineWidth = (major ? 1.2 : 0.5) * dpr; ctx.stroke();
          }
        }

        if (ring.r > baseR * 1.0) {
          const numArcs = ring.r > baseR * 3 ? 4 : ring.r > baseR * 2 ? 3 : 2;
          const arcLen = Math.PI * 0.4;
          for (let i = 0; i < numArcs; i++) {
            const startA = (i / numArcs) * Math.PI * 2 + frame * ring.speed * 2.5;
            ctx.beginPath(); ctx.arc(0, 0, ring.r + 5 * dpr, startA, startA + arcLen);
            ctx.strokeStyle = `rgba(77,227,255,${ring.alpha * 0.7 * pulse})`;
            ctx.lineWidth = 2.5 * dpr; ctx.stroke();
          }
        }
        ctx.restore();
      });

      // Triangle frame
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * 0.002);
      const triR = baseR * 1.4;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * triR, Math.sin(a) * triR);
        else ctx.lineTo(Math.cos(a) * triR, Math.sin(a) * triR);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(77,227,255,${0.5 * pulse})`; ctx.lineWidth = 2 * dpr; ctx.stroke();
      ctx.restore();

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR);
      coreGrad.addColorStop(0, `rgba(200,240,255,${0.95 * pulse})`);
      coreGrad.addColorStop(0.3, `rgba(77,227,255,${0.5 * pulse})`);
      coreGrad.addColorStop(1, "rgba(77,227,255,0)");
      ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(cx, cy, baseR, 0, Math.PI * 2); ctx.fill();

      // Inner core
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.25);
      innerGrad.addColorStop(0, `rgba(255,255,255,${0.98 * pulse})`);
      innerGrad.addColorStop(0.5, `rgba(180,240,255,${0.6 * pulse})`);
      innerGrad.addColorStop(1, "rgba(77,227,255,0)");
      ctx.fillStyle = innerGrad; ctx.beginPath(); ctx.arc(cx, cy, baseR * 0.25, 0, Math.PI * 2); ctx.fill();

      // Particles
      particles.forEach((p) => {
        p.angle += p.speed; p.r += p.drift;
        if (p.r < 30) p.drift = Math.abs(p.drift);
        if (p.r > 200) p.drift = -Math.abs(p.drift);
        const px = cx + Math.cos(p.angle) * p.r * dpr;
        const py = cy + Math.sin(p.angle) * p.r * dpr;
        const flicker = 0.4 + 0.6 * Math.sin(frame * 0.04 + p.angle * 5);
        ctx.beginPath(); ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,227,255,${p.alpha * flicker * pulse})`; ctx.fill();
        if (p.size > 1.2) {
          ctx.beginPath(); ctx.arc(px, py, p.size * 2.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(77,227,255,${p.alpha * flicker * 0.1 * pulse})`; ctx.fill();
        }
      });

      // Crosshairs
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * 0.001);
      ctx.strokeStyle = `rgba(77,227,255,${0.04 * pulse})`; ctx.lineWidth = 0.5 * dpr;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * baseR * 1.5, Math.sin(a) * baseR * 1.5);
        ctx.lineTo(Math.cos(a) * baseR * 4.5, Math.sin(a) * baseR * 4.5); ctx.stroke();
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} style={{ imageRendering: "auto" }} />
    </div>
  );
}
