'use client';
import { useEffect, useRef, useCallback } from 'react';

/* ──────────────────────────────────────────────────────────
   MemoryParticles — Generative Canvas for TheGap section.
   
   This is NOT a decorative particle effect. It's a visual 
   metaphor: memories start as an organized network of 
   connected dots (like neural connections). As the user 
   scrolls and the "forgetting" narrative progresses, 
   connections break, dots drift and dissolve. By the end, 
   almost nothing remains.
   
   This communicates Wivme's core problem statement through 
   generative art, not through words alone.
   ────────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  baseSize: number;
  opacity: number;
  speed: number;
  angle: number;
  drift: number;
  color: string;
  /** 0-1: how "central" this particle is. Central particles resist decay longer. */
  resilience: number;
  /** subtle size oscillation phase */
  breathPhase: number;
}

const COLORS = ['#6346E6', '#E8573D', '#3B7D5E', '#D4940A', '#2D8FCA'];

export default function MemoryParticles({
  getProgress,
}: {
  getProgress: () => number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const cols = 10;
    const rows = 7;
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(cx, cy);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = w * 0.12 + (i / (cols - 1)) * w * 0.76 + (Math.random() - 0.5) * 20;
        const y = h * 0.15 + (j / (rows - 1)) * h * 0.7 + (Math.random() - 0.5) * 15;
        const distFromCenter = Math.hypot(x - cx, y - cy) / maxDist;
        const baseSize = 2.5 + Math.random() * 2.5;

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          size: baseSize,
          baseSize,
          opacity: 1,
          speed: 0.2 + Math.random() * 0.6,
          angle: Math.random() * Math.PI * 2,
          drift: 0.3 + Math.random() * 0.7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          resilience: 1 - distFromCenter * 0.9,
          breathPhase: Math.random() * Math.PI * 2,
        });
      }
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* Skip the canvas entirely on small / low-power devices.
       The narrative copy still lands; we just save the battery. */
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isSmallScreen || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = initParticles(rect.width, rect.height);
    };
    resize();

    let frameCount = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const p = getProgress();
      frameCount++;

      const particles = particlesRef.current;

      /* ─── Update particles ─── */
      particles.forEach((pt) => {
        // When should this particle start decaying?
        // Outer particles go first, center ones last.
        const decayStart = pt.resilience * 0.6;
        const decayProgress = Math.max(0, (p - decayStart) / (1 - decayStart));

        if (decayProgress > 0) {
          pt.angle += 0.008 * pt.drift;
          const driftX = Math.sin(pt.angle) * pt.speed * decayProgress * 1.5;
          const driftY = pt.speed * decayProgress * 0.8;
          pt.x += driftX;
          pt.y += driftY;
          pt.opacity = Math.max(0, 1 - decayProgress * 1.3);
          pt.size = pt.baseSize * Math.max(0, 1 - decayProgress * 0.8);
        } else {
          // Gentle return to origin + breathing
          pt.x += (pt.originX - pt.x) * 0.04;
          pt.y += (pt.originY - pt.y) * 0.04;
          pt.opacity = Math.min(1, pt.opacity + 0.02);
          pt.size = pt.baseSize + Math.sin(frameCount * 0.015 + pt.breathPhase) * 0.4;
        }
      });

      /* ─── Draw connections ─── */
      const connectionOpacity = 0.07 * Math.max(0, 1 - p * 1.5);
      if (connectionOpacity > 0.005) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          if (a.opacity < 0.2) continue;
          for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
            const b = particles[j];
            if (b.opacity < 0.2) continue;
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist < 70) {
              const lineAlpha = connectionOpacity * (1 - dist / 70) * Math.min(a.opacity, b.opacity);
              ctx.strokeStyle = `rgba(26, 26, 30, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }

      /* ─── Draw particles ─── */
      particles.forEach((pt) => {
        if (pt.opacity < 0.01) return;
        ctx.globalAlpha = pt.opacity;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.5, pt.size), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initParticles, getProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
