'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import ebbinghausCurveImage from '@/Images/7 Ebbinghaus curve.png';

/* ──────────────────────────────────────────────────────────
   WhyItWorks — Authority section with animated stats.
   
   Creative choices:
   1. Stats use count-up animation via GSAP proxy objects —
      numbers tick from 0 to their final value as they enter 
      the viewport. This creates a sense of data materializing.
   2. Each stat sits on a colored background (violet, coral, 
      sage, amber) creating visual density and color richness 
      without being decorative — the color distinguishes the 
      metric category.
   3. Restrained animation per Plan.md section 9 — this is 
      the trust section. Motion slows down. Typography becomes 
      more restrained. No script font.
   ────────────────────────────────────────────────────────── */

interface StatData {
  value: number;
  suffix: string;
  label: string;
  color: string;
  display: string;
}

export default function WhyItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ─── Count-up animation for stats ─── */
      const statEls = statsRef.current.filter(Boolean) as HTMLDivElement[];

      statEls.forEach((statEl, i) => {
        const numEl = statEl.querySelector(
          '.why-it-works__stat-number'
        ) as HTMLDivElement | null;
        if (!numEl) return;

        const data = stats[i];
        if (!data || data.value === 0) return; // Skip "0" — it's emphatic, not animated

        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: data.value,
          duration: 1.8,
          ease: 'power2.out',
          snap: { val: 1 },
          scrollTrigger: {
            trigger: statEl,
            start: 'top 82%',
            once: true,
          },
          onUpdate: () => {
            numEl.textContent = Math.round(proxy.val) + data.suffix;
          },
        });
      });

      /* ─── Section entrance — subtle, restrained ─── */
      gsap.from('.why-it-works__headline', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  const stats: StatData[] = [
    {
      value: 67,
      suffix: '%',
      display: '0%',
      label: 'Forgotten in 24 hours without review (Ebbinghaus, 1885)',
      color: 'violet',
    },
    {
      value: 80,
      suffix: '%',
      display: '0%',
      label: 'Reduction in forgetting from spaced retrieval (Roediger & Butler, 2011)',
      color: 'coral',
    },
    {
      value: 7,
      suffix: ' months',
      display: '0',
      label: 'Of additional academic progress per student (EEF, metacognitive strategies)',
      color: 'sage',
    },
    {
      value: 254,
      suffix: '',
      display: '0',
      label: 'Independent studies in the spaced-practice meta-analysis (Cepeda et al., 2006)',
      color: 'amber',
    },
  ];

  return (
    <section ref={sectionRef} className="why-it-works" id="why">
      <div className="container">
        <div className="why-it-works__inner">
          <div>
            <div
              className="label label--sage"
              style={{ marginBottom: 'var(--s-sm)' }}
            >
              The evidence
            </div>
            <h2 className="why-it-works__headline">
              Built on science,
              <br />
              not <span className="serif">promises.</span>
            </h2>
            <p className="why-it-works__body">
              The science is settled. Memory decays on a predictable curve, and
              well-timed retrieval can flatten it. None of this is new. It&apos;s been
              replicated across 140 years of cognitive psychology.
            </p>
            <p className="why-it-works__body">
              What&apos;s new is making it work inside an actual school day, without
              extra study sessions, extra homework, or another app the family has
              to fight to keep open. That&apos;s the part Wivme builds.
            </p>
            <div className="why-it-works__image" style={{ marginTop: 'var(--s-md)' }}>
              <Image
                src={ebbinghausCurveImage}
                alt="Research diagram: Ebbinghaus forgetting curve with Wivme intervention points"
                fill
                sizes="(max-width: 900px) 92vw, 620px"
                className="why-it-works__image-el"
              />
            </div>
            <p className="why-it-works__graph-note">
              Based on the Ebbinghaus forgetting curve model (Ebbinghaus, 1885)
              and modern spacing-effect validation studies.
            </p>
          </div>

          <div>
            <div className="why-it-works__stats">
              {stats.map((s, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    statsRef.current[i] = el;
                  }}
                  className={`why-it-works__stat why-it-works__stat--${s.color}`}
                >
                  <div className="why-it-works__stat-number">{s.display}</div>
                  <div className="why-it-works__stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="why-it-works__footnote">
              Sources: Ebbinghaus (1885); Cepeda et al., 2006 meta-analysis of 254
              studies; Roediger &amp; Butler, 2011; Karpicke &amp; Roediger,{' '}
              <em>Science</em>, 2008; Education Endowment Foundation. Our own pilot
              data will be published openly at the end of this academic year.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
