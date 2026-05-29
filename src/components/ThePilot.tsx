'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useAudienceModal } from './AudienceModalProvider';

/* ──────────────────────────────────────────────────────────
   ThePilot — The pilot program section.

   Positioning: this is not a discount. It's an invitation to
   shape the product before its full launch next academic year.

   Creative choices:
   1. Pricing reveal — the ₹1,500/year price draws on, then a
      strikethrough sweeps across, then "FREE" types in. The
      whole thing is one continuous gesture, not three separate
      animations. The visual metaphor is value being given.
   2. Two-column: the "what you get" list on left, the price
      card on right. Mirrors the asymmetry used elsewhere on
      site without inventing a new pattern.
   3. The four pillars use the same colored-dot label pattern
      as the rest of the site for visual consistency.
   ────────────────────────────────────────────────────────── */

export default function ThePilot() {
  const sectionRef = useRef<HTMLElement>(null);
  const priceLineRef = useRef<HTMLSpanElement>(null);
  const strikeRef = useRef<HTMLSpanElement>(null);
  const freeRef = useRef<HTMLDivElement>(null);
  const { openModal } = useAudienceModal();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.the-pilot__headline', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });

      gsap.from('.the-pilot__pillar', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '.the-pilot__pillars', start: 'top 80%', once: true },
      });

      const priceCard = section.querySelector('.the-pilot__price-card');
      if (priceCard && strikeRef.current && freeRef.current) {
        gsap.set(strikeRef.current, { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(freeRef.current, { y: 24, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: priceCard, start: 'top 70%', once: true },
        });

        tl.from(priceLineRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          ease: 'expo.out',
        })
          .to(strikeRef.current, {
            scaleX: 1,
            duration: 0.55,
            ease: 'power2.inOut',
          }, '+=0.25')
          .to(freeRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'expo.out',
          }, '-=0.1');
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="the-pilot" id="pilot">
      <div className="container">
        <div className="the-pilot__head">
          <div className="label label--coral">Pilot now open</div>
          <h2 className="the-pilot__headline">
            Your child studied for hours.
            <br />
            <span className="serif">How much do they actually remember?</span>
          </h2>
          <p className="the-pilot__lede">
            For most parents, the honest answer is: <em>we don&apos;t know, until the
            report card arrives.</em> We&apos;re changing that, starting with{' '}
            <strong>Grade 8 students on the ICSE and CBSE boards</strong>. The pilot
            isn&apos;t about scale. It&apos;s about quietly learning what genuinely
            helps a real student remember what they were taught, before we open it
            up fully next academic year.
          </p>
        </div>

        <div className="the-pilot__grid">
          <div className="the-pilot__pillars">
            <div className="the-pilot__pillar">
              <div className="the-pilot__pillar-num">01</div>
              <h3>Built around your child&apos;s feedback</h3>
              <p>
                Every pilot family helps decide how Wivme works in real classrooms.
                What sticks gets shipped. What doesn&apos;t, doesn&apos;t.
              </p>
            </div>
            <div className="the-pilot__pillar">
              <div className="the-pilot__pillar-num">02</div>
              <h3>Free for founding parents</h3>
              <p>
                The pilot is fully free for the founding cohort. Once we open
                publicly next academic year, the standard subscription will be
                ₹1,500/year per student.
              </p>
            </div>
            <div className="the-pilot__pillar">
              <div className="the-pilot__pillar-num">03</div>
              <h3>Other grades, soon</h3>
              <p>
                We&apos;re starting with Grade 8 to do it well. Other grades roll out
                after the pilot. Join the waitlist and we&apos;ll let you know the
                moment your child&apos;s grade opens.
              </p>
            </div>
            <div className="the-pilot__pillar">
              <div className="the-pilot__pillar-num">04</div>
              <h3>Full launch · next academic year</h3>
              <p>
                The pilot runs through this year. Founding parents stay closest to
                the product as it grows, and get first access to everything that
                comes next.
              </p>
            </div>
          </div>

          <div className="the-pilot__expectations">
            <div className="the-pilot__expectations-label">
              What the pilot looks like for your child
            </div>
            <ul className="the-pilot__expectations-list">
              <li>Around 10 focused minutes a day, on a phone</li>
              <li>Tied to what they&apos;re actually being taught at school</li>
              <li>No extra homework, no extra tutoring sessions</li>
              <li>You&apos;ll see what&apos;s sticking and what isn&apos;t, long before the next test</li>
              <li>No card, no auto-renewal, opt out any time</li>
            </ul>
          </div>

          <aside className="the-pilot__price-card">
            <div className="the-pilot__price-badge">
              <span className="the-pilot__price-badge-dot" aria-hidden />
              Founding parents · Year 1
            </div>
            <div className="the-pilot__price-label">Pilot pricing</div>

            <div className="the-pilot__price-strike-wrap">
              <span ref={priceLineRef} className="the-pilot__price-strike">
                ₹1,500 / year / student
                <span ref={strikeRef} className="the-pilot__strike-line" aria-hidden />
              </span>
            </div>

            <div ref={freeRef} className="the-pilot__price-free">
              Free
              <span className="the-pilot__price-free-sub">
                for founding parents
              </span>
            </div>

            <ul className="the-pilot__price-list">
              <li>Full access for one student</li>
              <li>Direct line to the founders</li>
              <li>Shape what we build next</li>
              <li>No card, no hidden charges</li>
            </ul>

            <button type="button" className="btn btn--coral the-pilot__cta" onClick={() => openModal()}>
              Register for the pilot
            </button>
            <p className="the-pilot__cta-note">
              Not on Grade 8 ICSE/CBSE? Join the waitlist for your child&apos;s grade.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
