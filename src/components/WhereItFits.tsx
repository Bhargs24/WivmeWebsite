'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import ScrollIndicator from './ScrollIndicator';
import classImage from '@/Images/8 class.png';
import wivmeImage from '@/Images/9 wivme.png';
import examImage from '@/Images/10 exam.png';

export default function WhereItFits() {
  const sectionRef    = useRef<HTMLElement>(null);
  const classCardRef  = useRef<HTMLDivElement>(null);
  const wivmeCardRef  = useRef<HTMLDivElement>(null);
  const examCardRef   = useRef<HTMLDivElement>(null);
  const arrow1WrapRef = useRef<HTMLDivElement>(null);
  const arrow2WrapRef = useRef<HTMLDivElement>(null);
  const arrow1PathRef = useRef<SVGPathElement>(null);
  const arrow2PathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const getPathLength = (path: SVGPathElement | null) => {
        if (!path || typeof path.getTotalLength !== 'function') return null;
        try {
          const len = path.getTotalLength();
          return Number.isFinite(len) && len > 0 ? len : null;
        } catch {
          return null;
        }
      };

      const classImageEl = classCardRef.current?.querySelector<HTMLElement>('.where-it-fits__step-image');
      const wivmeImageEl = wivmeCardRef.current?.querySelector<HTMLElement>('.where-it-fits__step-image');
      const examImageEl = examCardRef.current?.querySelector<HTMLElement>('.where-it-fits__step-image');

      /* ─── Initial state: side cards squeezed inward, center card hidden underneath ─── */
      gsap.set(classCardRef.current, { x: 210, zIndex: 3 });
      gsap.set(examCardRef.current, { x: -210, zIndex: 3 });
      gsap.set(wivmeCardRef.current, {
        y: 140,
        autoAlpha: 0,
        scale: 0.78,
        zIndex: 1,
      });
      gsap.set([arrow1WrapRef.current, arrow2WrapRef.current], {
        autoAlpha: 0,
        scaleX: 0.6,
      });
      if (classImageEl) {
        gsap.set(classImageEl, { scale: 1.12, yPercent: 6, transformOrigin: 'center center' });
      }
      if (wivmeImageEl) {
        gsap.set(wivmeImageEl, { scale: 1.22, yPercent: 12, transformOrigin: 'center center' });
      }
      if (examImageEl) {
        gsap.set(examImageEl, { scale: 1.12, yPercent: 6, transformOrigin: 'center center' });
      }

      /* ─── Prepare arrow paths for drawing ─── */
      [arrow1PathRef.current, arrow2PathRef.current].forEach((path) => {
        const len = getPathLength(path);
        if (!path || !len) return;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });

      /* ─── Scroll-scrubbed spread + rise timeline ─── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          end: 'bottom 18%',
          scrub: 2,
        },
      });

      tl
        .to(classCardRef.current, { x: 0, ease: 'power2.out' }, 0)
        .to(examCardRef.current, { x: 0, ease: 'power2.out' }, 0)
        .to(wivmeCardRef.current, { y: 18, autoAlpha: 0.78, scale: 0.9, ease: 'power2.out' }, 0.18)
        .set(wivmeCardRef.current, { zIndex: 4 }, 0.46)
        .to(wivmeCardRef.current, { y: 0, autoAlpha: 1, scale: 1, ease: 'power2.out' }, 0.46)
        .to([arrow1WrapRef.current, arrow2WrapRef.current], { autoAlpha: 1, scaleX: 1, ease: 'power2.out' }, 0.76);

      if (classImageEl) {
        tl.to(classImageEl, { scale: 1.04, yPercent: 0, ease: 'power2.out' }, 0);
      }

      if (examImageEl) {
        tl.to(examImageEl, { scale: 1.04, yPercent: 0, ease: 'power2.out' }, 0);
      }

      if (wivmeImageEl) {
        tl.to(wivmeImageEl, { scale: 1.06, yPercent: 0, ease: 'power2.out' }, 0.12);
      }

      /* ─── Arrow path drawing fires once Wivme is settled ─── */
      [arrow1PathRef.current, arrow2PathRef.current].forEach((path, i) => {
        const len = getPathLength(path);
        if (!path || !len) return;
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'expo.out',
          delay: i * 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 28%',
            once: true,
          },
        });
      });

      /* ─── Tagline entrance ─── */
      gsap.from('.where-it-fits__tagline', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.where-it-fits__tagline',
          start: 'top 88%',
          once: true,
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="where-it-fits">
      <div className="container">
        <div className="where-it-fits__label">
          <div className="label label--sage">Where Wivme fits</div>
        </div>

        <div className="where-it-fits__flow">
          <article ref={classCardRef} className="where-it-fits__step-card where-it-fits__step-card--class">
            <div className="where-it-fits__step-media">
              <Image
                src={classImage}
                alt="Students in class during a lesson"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1100px) 34vw, 300px"
                className="where-it-fits__step-image"
              />
            </div>
            <div className="where-it-fits__step-body">
              <div className="where-it-fits__step-kicker">Before</div>
              <h3 className="where-it-fits__step-title">Class</h3>
              <p className="where-it-fits__step-copy">
                Teaching happens here. Understanding begins here. But retention usually does not.
              </p>
            </div>
          </article>

          <div ref={arrow1WrapRef} className="where-it-fits__arrow-wrap" aria-hidden="true">
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
              <path
                ref={arrow1PathRef}
                d="M2 12 L68 12 L58 4 M68 12 L58 20"
                stroke="var(--c-sage)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <article ref={wivmeCardRef} className="where-it-fits__step-card where-it-fits__step-card--highlight">
            <div className="where-it-fits__step-media where-it-fits__step-media--highlight">
              <Image
                src={wivmeImage}
                alt="Wivme revision prompts delivered between class and exam"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1100px) 34vw, 300px"
                className="where-it-fits__step-image"
              />
            </div>
            <div className="where-it-fits__step-body where-it-fits__step-body--highlight">
              <div className="where-it-fits__step-kicker where-it-fits__step-kicker--highlight">Between</div>
              <h3 className="where-it-fits__step-title">Wivme</h3>
              <p className="where-it-fits__step-copy where-it-fits__step-copy--highlight">
                The memory layer that quietly reinforces key ideas after class, before forgetting wins.
              </p>
            </div>
          </article>

          <div ref={arrow2WrapRef} className="where-it-fits__arrow-wrap" aria-hidden="true">
            <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
              <path
                ref={arrow2PathRef}
                d="M2 12 L68 12 L58 4 M68 12 L58 20"
                stroke="var(--c-sage)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <article ref={examCardRef} className="where-it-fits__step-card where-it-fits__step-card--exam">
            <div className="where-it-fits__step-media">
              <Image
                src={examImage}
                alt="Students taking an exam"
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1100px) 34vw, 300px"
                className="where-it-fits__step-image"
              />
            </div>
            <div className="where-it-fits__step-body">
              <div className="where-it-fits__step-kicker">After</div>
              <h3 className="where-it-fits__step-title">Exam</h3>
              <p className="where-it-fits__step-copy">
                Retrieval happens here. Wivme improves what students can actually bring back at this moment.
              </p>
            </div>
          </article>
        </div>

        <p className="where-it-fits__tagline">
          Between the lesson and the test,{' '}
          <span className="serif">Wivme works in silence.</span>
        </p>

        <ScrollIndicator />
      </div>
    </section>
  );
}
