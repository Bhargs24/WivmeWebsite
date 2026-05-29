'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useAudienceModal } from './AudienceModalProvider';

/* ──────────────────────────────────────────────────────────
   CallToAction — Character-assembly animation.
   
   Creative choice (the "new recipe"):
   Instead of a standard fade-in, the headline text starts 
   with each character scattered — random positions, scales, 
   rotations, zero opacity. As the section enters the viewport, 
   GSAP assembles every character into its correct position 
   with staggered timing and expo easing.
   
   The visual metaphor: scattered knowledge assembling into 
   clarity. This is what Wivme does — it takes scattered 
   fragments of understanding and reassembles them into 
   lasting memory.
   
   This is NOT a standard GSAP animation. Characters start 
   in randomized states — every visit produces slightly 
   different entrance paths.
   ────────────────────────────────────────────────────────── */

export default function CallToAction() {
  const { openModal } = useAudienceModal();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headlineRef.current) return;

    const ctx = gsap.context(() => {
      const headline = headlineRef.current!;
      const text = headline.textContent || '';
      headline.innerHTML = '';
      headline.style.position = 'relative';

      const chars: HTMLSpanElement[] = [];

      /* Wrap each WORD in an inline-block container so words never
         break mid-character. Individual characters inside still scatter. */
      const words = text.split(' ');
      words.forEach((word, wi) => {
        const wordWrap = document.createElement('span');
        wordWrap.style.display = 'inline-block';
        wordWrap.style.whiteSpace = 'nowrap';

        word.split('').forEach((char) => {
          const charSpan = document.createElement('span');
          charSpan.textContent = char;
          charSpan.style.display = 'inline-block';
          charSpan.style.willChange = 'transform, opacity';
          wordWrap.appendChild(charSpan);
          chars.push(charSpan);
        });

        headline.appendChild(wordWrap);
        if (wi < words.length - 1) {
          headline.appendChild(document.createTextNode(' '));
        }
      });

      /* Scatter characters to random positions */
      chars.forEach((ch) => {
        gsap.set(ch, {
          x: (Math.random() - 0.5) * 180,
          y: (Math.random() - 0.5) * 80,
          opacity: 0,
          scale: 0.4 + Math.random() * 0.4,
          rotation: (Math.random() - 0.5) * 25,
        });
      });

      /* Assemble on scroll */
      gsap.to(chars, {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.018,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          once: true,
        },
      });

      /* Sub + action buttons — simple fade after headline assembles */
      gsap.from(['.cta__sub', '.cta__actions'], {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          once: true,
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cta dark-s">
      <div className="container">
        <h2 ref={headlineRef} className="cta__headline">
          Be one of the first to use Wivme.
        </h2>
        <p className="cta__sub">
          Free this academic year for founding parents and pilot schools. The
          version we launch next year will be shaped by the people in the room now.
        </p>
        <div className="cta__actions">
          <button type="button" className="btn btn--coral" onClick={() => openModal('parent')}>
            Register as a parent
          </button>
          <button type="button" className="btn btn--outline" onClick={() => openModal('school')}>
            I&apos;m a school
          </button>
        </div>

      </div>
    </section>
  );
}
