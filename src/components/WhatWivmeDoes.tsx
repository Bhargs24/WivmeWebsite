'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import ScrollIndicator from '@/components/ScrollIndicator';
import promptImage from '@/Images/1 Student receiving a micro-revision prompt on phone.png';
import repetitionImage from '@/Images/2 Spaced repetition schedule visualization.png';
import dashboardImage from '@/Images/3 Teacher dashboard showing class retention data.png';

/* ──────────────────────────────────────────────────────────
   WhatWivmeDoes — Feature explanation with creative motion.
   
   Creative choices:
   1. Feature cards enter with back.out easing — they 
      overshoot slightly and settle, as if they have physical 
      mass. Not the standard fade-up.
   2. Big typographic words use clip-path reveal from left — 
      the word "cuts" into existence. Architecture, not fade.
   3. Variable font weight animation on scroll (Inter supports 
      weight 100–900). "Recall" gains visual mass as it 
      scrolls into the viewport center — the word literally 
      gets heavier. This is a creative use of variable fonts + 
      GSAP that most sites never do.
   4. Different typographic treatment per word creates the 
      "structured rebellion" from the design doc.
   ────────────────────────────────────────────────────────── */

export default function WhatWivmeDoes() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const labelsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ─── Feature cards: back.out overshoot entrance ─── */
      const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
      cards.forEach((card, i) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
          delay: i * 0.12,
        });
      });

      const labels = labelsRef.current.filter(Boolean) as HTMLDivElement[];
      labels.forEach((label, i) => {
        const { side } = label.dataset;
        gsap.fromTo(
          label,
          {
            opacity: 0.15,
            x: side === 'right' ? -240 : 240,
            filter: 'blur(4px)',
          },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i],
              start: 'top 92%',
              end: 'top 52%',
              scrub: 0.9,
            },
          }
        );
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      num: '01',
      title: 'Recall, the moment it matters',
      desc: 'Short, low-effort revision moments arrive on your child’s phone exactly when memory starts to fade. Not on a calendar, not on a quiz day, but at the moment science says the lesson is most at risk of being lost.',
      color: 'violet',
      imgLabel: 'Student receiving a micro-revision prompt on phone',
      imageSrc: promptImage,
    },
    {
      num: '02',
      title: 'Built into the school day',
      desc: 'Most learning apps live or die by whether your child feels like opening them. Wivme doesn’t. It’s tied to the lessons their school is actually teaching, every week. So it sticks where other apps quietly stop being used.',
      color: 'coral',
      imgLabel: 'Spaced repetition schedule visualization',
      imageSrc: repetitionImage,
    },
    {
      num: '03',
      title: 'Memory, made visible',
      desc: 'For the first time, what your child has actually retained, not just what they sat through, becomes something you and the school can see. Weeks before the next test, not after the report card.',
      color: 'sage',
      imgLabel: 'Teacher dashboard showing class retention data',
      imageSrc: dashboardImage,
    },
  ];

  const sideLabelByNum: Record<string, string> = {
    '01': 'Recall',
    '02': 'Reinforce',
    '03': 'Measure',
  };

  return (
    <section ref={sectionRef} className="what-we-do" id="how">
      <div className="container what-we-do__layout">
        <div className="what-we-do__heading-col">
          <div className="what-we-do__label">How it works</div>
          <h2 className="what-we-do__headline">
            Memory you can{' '}
            <span className="serif">finally</span> see.
          </h2>
        </div>

        <div className="what-we-do__cards-col">
          <div className="what-we-do__features">
            {features.map((f, i) => {
              const sideLabel = sideLabelByNum[f.num];
              return (
                <div
                  key={f.num}
                  className={`what-we-do__card-wrap what-we-do__card-wrap--${f.num}`}
                >
                  <div
                    className={`what-we-do__side-label what-we-do__side-label--${sideLabel.toLowerCase()}`}
                    data-side={f.num === '02' ? 'right' : 'left'}
                    ref={(el) => {
                      labelsRef.current[i] = el;
                    }}
                    aria-hidden="true"
                  >
                    {sideLabel}
                  </div>
                  <div
                    ref={(el) => {
                      cardsRef.current[i] = el;
                    }}
                    className={`what-we-do__card what-we-do__card--${f.color}`}
                  >
                    <div className="what-we-do__card-num">{f.num}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <div className="what-we-do__card-image">
                      <Image
                        src={f.imageSrc}
                        alt={f.imgLabel}
                        fill
                        sizes="(max-width: 1200px) 90vw, 340px"
                        className="what-we-do__card-image-el"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ScrollIndicator />
        </div>
      </div>
    </section>
  );
}
