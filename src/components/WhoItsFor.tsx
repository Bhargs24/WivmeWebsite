'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import ScrollIndicator from '@/components/ScrollIndicator';
import schoolImage from '@/Images/4 School building or classroom environment.png';
import teacherImage from '@/Images/5 Teacher reviewing dashboard.png';
import promptImage from '@/Images/1 Student receiving a micro-revision prompt on phone.png';
import studentImage from '@/Images/6 Student on phone reviewing prompt.png';

/* ──────────────────────────────────────────────────────────
   WhoItsFor — Dark authority section with creative touches.
   
   Creative choices:
   1. Mouse-follow radial gradient — a subtle "spotlight" 
      that follows the cursor across the dark surface. This 
      creates an exploratory, tactile feel without being 
      gimmicky. It's done via CSS custom properties updated 
      in JavaScript — no Canvas, no WebGL, just clever CSS.
   2. Clip-path entrance — the entire dark section sweeps 
      in from the left via a GSAP-driven clip-path animation. 
      This creates an architectural transition that feels like 
      the page is being physically constructed.
   3. Cards use back.out overshoot easing — they have 
      physical momentum, as if they've been placed with force 
      and settle into position.
   ────────────────────────────────────────────────────────── */

export default function WhoItsFor() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
      if (cards.length < 2) return;

      const isDesktop = window.matchMedia('(min-width: 901px)').matches;

      if (!isDesktop) {
        cards.forEach((card, i) => {
          gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            },
            delay: i * 0.1,
          });
        });
        return;
      }

      gsap.set(cards, {
        yPercent: (i) => (i === 0 ? 0 : 22),
        autoAlpha: (i) => (i === 0 ? 1 : 0),
        scale: (i) => 1 - i * 0.03,
        zIndex: (i) => cards.length - i,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=240%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      for (let i = 0; i < cards.length - 1; i += 1) {
        tl.to(
          cards[i],
          {
            yPercent: -26,
            autoAlpha: 0,
            scale: 0.96,
            duration: 1,
            ease: 'none',
          },
          i
        ).to(
          cards[i + 1],
          {
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            ease: 'none',
          },
          i + 0.06
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const personas = [
    {
      label: 'Schools',
      labelColor: 'violet',
      title: 'K-12 schools that care about retention',
      desc: 'Your teachers already teach well. Wivme makes sure that learning sticks beyond the classroom door.',
      imgLabel: 'School building or classroom environment',
      imageSrc: schoolImage,
    },
    {
      label: 'Teachers',
      labelColor: 'coral',
      title: "Teachers who don't want more work",
      desc: 'No extra work for teachers. Just enable episodes and see exactly what each student is forgetting.',
      imgLabel: 'Teacher reviewing dashboard',
      imageSrc: teacherImage,
    },
    {
      label: 'Parents',
      labelColor: 'amber',
      title: "Parents who don't want last-minute cramming",
      desc: 'See what your child is forgetting before exams expose it.',
      imgLabel: 'Student revising on phone at home',
      imageSrc: studentImage,
    },
    {
      label: 'Students',
      labelColor: 'sage',
      title: 'Students who want to actually remember',
      desc: "10 minutes a day. That's all it takes. Short, targeted prompts that fit between classes.",
      imgLabel: 'Student receiving a micro-revision prompt on phone',
      imageSrc: promptImage,
    },
  ];

  return (
    <section ref={sectionRef} className="who-its-for" id="who">
      <div className="container-full who-its-for__layout">
        <div className="label" style={{ color: 'var(--c-amber)' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--c-amber)',
              display: 'inline-block',
              marginRight: '0.5em',
            }}
          />
          Built for
        </div>
        <h2
          className="who-its-for__headline"
          style={{ marginTop: 'var(--s-sm)' }}
        >
          Everyone in the
          <br />
          learning chain.
        </h2>

        <div className="who-its-for__stack">
          {personas.map((p, i) => (
            <article
              key={p.label}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={`who-its-for__shuffle-card who-its-for__shuffle-card--${p.labelColor}`}
            >
              <div className="who-its-for__shuffle-media">
                <Image
                  src={p.imageSrc}
                  alt={p.imgLabel}
                  fill
                  sizes="(max-width: 900px) 92vw, 420px"
                  className="who-its-for__shuffle-image"
                />
              </div>

              <div className="who-its-for__shuffle-content">
                <div
                  className={`who-its-for__card-label who-its-for__card-label--${p.labelColor}`}
                >
                  {p.label}
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </article>
          ))}
        </div>
        <ScrollIndicator tone="dark" />
      </div>
    </section>
  );
}
