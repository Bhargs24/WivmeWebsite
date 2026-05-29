'use client';
import { useEffect, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import MemoryParticles from './MemoryParticles';
import ScrollIndicator from './ScrollIndicator';

/* ──────────────────────────────────────────────────────────
   TheGap — Pinned scroll narrative with generative canvas.
   
   Creative choices:
   1. MemoryParticles canvas behind text — a generative dot 
      network that dissolves as the user scrolls. Particles 
      visually ARE the memories being lost.
   2. ScrollTrigger pin + scrub — text lines reveal 
      progressively, each introducing a deeper consequence.
   3. Retention bars shrink in real-time — physical metaphor.
   4. The particle progress is driven by the SAME 
      ScrollTrigger via a ref callback — no React state 
      re-renders, pure rAF performance.
   ────────────────────────────────────────────────────────── */

export default function TheGap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const annotationRef = useRef<HTMLDivElement>(null);

  const getProgress = useCallback(() => progressRef.current, []);

  useEffect(() => {
    if (!wrapperRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      const lines = linesRef.current.filter(Boolean) as HTMLDivElement[];
      const bars = barsRef.current.filter(Boolean) as HTMLDivElement[];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=250%',
          pin: pinRef.current,
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });

      /* Line 1: the setup */
      tl.to(lines[0], { opacity: 1, y: 0, duration: 0.15 }, 0);

      /* Line 2: the turn */
      tl.to(lines[1], { opacity: 1, y: 0, duration: 0.15 }, 0.2);

      /* Line 3: the punchline — coral accent, larger */
      tl.to(lines[2], { opacity: 1, y: 0, scale: 1, duration: 0.15 }, 0.4);

      /* Bars shrink — memory decay in real-time */
      bars.forEach((bar, i) => {
        const startHeight = [120, 85, 45, 20, 8][i] ?? 50;
        gsap.set(bar, { height: startHeight });
        tl.to(bar, { height: startHeight * 0.12, duration: 0.4 }, 0.15 + i * 0.08);
      });

      /* Line 4: the consequence */
      tl.to(lines[3], { opacity: 1, y: 0, duration: 0.15 }, 0.65);

      /* Annotation — handwritten "this is the gap" */
      tl.to(annotationRef.current, { opacity: 1, duration: 0.12 }, 0.82);
    }, wrapperRef.current);

    return () => ctx.revert();
  }, []);

  const lineData = [
    { text: 'Your child understands the lesson.', cls: '' },
    { text: 'Then they forget. Within hours.', cls: '' },
    { text: '67% gone by tomorrow.', cls: 'the-gap__line--accent' },
    { text: "No one was tracking what was lost. Until now.", cls: 'the-gap__line--small' },
  ];

  const barColors = ['#6346E6', '#8B71F0', '#B9A5F7', '#D4C8FB', '#E5DFFC'];
  const barHeights = [120, 85, 45, 20, 8];

  return (
    <div ref={wrapperRef} className="the-gap">
      <div ref={pinRef} className="the-gap__pin">
        {/* Generative canvas — memory network dissolving */}
        <MemoryParticles getProgress={getProgress} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="label label--coral" style={{ marginBottom: 'var(--s-lg)' }}>
            The problem
          </div>

          {lineData.map((line, i) => (
            <div
              key={i}
              ref={(el) => {
                linesRef.current[i] = el;
              }}
              className={`the-gap__line ${line.cls}`}
              style={{ transform: 'translateY(20px)' }}
            >
              {line.text}
            </div>
          ))}

          <div className="the-gap__bar-container">
            {barHeights.map((h, i) => (
              <div
                key={i}
                ref={(el) => {
                  barsRef.current[i] = el;
                }}
                className="the-gap__bar"
                style={{ height: h, background: barColors[i] }}
              />
            ))}
          </div>
        </div>

        <div
          ref={annotationRef}
          className="annotation the-gap__annotation"
          style={{ opacity: 0 }}
        >
          &ldquo;this is the gap.&rdquo;
        </div>

        <ScrollIndicator />
      </div>
    </div>
  );
}
