'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  submitPilotRegistration,
  submitSchoolInquiry,
  submitWaitlist,
} from '@/lib/api';
import type { AudienceModalEntry } from './AudienceModalProvider';

type Step =
  | 'audience'
  | 'school'
  | 'parent'
  | 'pilotSuccess'
  | 'waitlistSuccess'
  | 'schoolSuccess';

interface AudienceModalProps {
  open: boolean;
  entry?: AudienceModalEntry;
  onClose: () => void;
}

const PILOT_GRADE = '8';
const PILOT_BOARDS = new Set(['ICSE', 'CBSE']);

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];
const SOURCES = [
  'Search',
  'Instagram',
  'Friend / family',
  'School',
  'News / press',
  'Other',
];

interface ParentForm {
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  grade: string;
  board: string;
  schoolName: string;
  city: string;
  source: string;
  _gotcha: string;
}

interface SchoolForm {
  schoolName: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  board: string;
  studentCount: string;
  message: string;
  _gotcha: string;
}

const emptyParent: ParentForm = {
  parentName: '',
  email: '',
  phone: '',
  studentName: '',
  grade: '',
  board: '',
  schoolName: '',
  city: '',
  source: '',
  _gotcha: '',
};

const emptySchool: SchoolForm = {
  schoolName: '',
  contactPerson: '',
  role: '',
  email: '',
  phone: '',
  city: '',
  board: '',
  studentCount: '',
  message: '',
  _gotcha: '',
};

export default function AudienceModal({ open, entry = 'audience', onClose }: AudienceModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState<Step>(entry);
  const [parentForm, setParentForm] = useState<ParentForm>(emptyParent);
  const [schoolForm, setSchoolForm] = useState<SchoolForm>(emptySchool);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;

        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setStep(entry);
      return;
    }
    setStep('audience');
    setParentForm(emptyParent);
    setSchoolForm(emptySchool);
    setErrorMsg(null);
    setSubmitting(false);
  }, [open, entry]);

  if (!open) return null;

  const isPilotEligible =
    parentForm.grade === PILOT_GRADE && PILOT_BOARDS.has(parentForm.board);

  const submitParent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (isPilotEligible) {
        await submitPilotRegistration({
          parentName: parentForm.parentName,
          email: parentForm.email,
          phone: parentForm.phone,
          studentName: parentForm.studentName,
          grade: parentForm.grade,
          board: parentForm.board,
          schoolName: parentForm.schoolName || undefined,
          city: parentForm.city || undefined,
          source: parentForm.source || undefined,
          _gotcha: parentForm._gotcha,
        });
        setStep('pilotSuccess');
      } else {
        await submitWaitlist({
          parentName: parentForm.parentName,
          email: parentForm.email,
          phone: parentForm.phone,
          studentName: parentForm.studentName || undefined,
          grade: parentForm.grade,
          board: parentForm.board || undefined,
          schoolName: parentForm.schoolName || undefined,
          city: parentForm.city || undefined,
          source: parentForm.source || undefined,
          _gotcha: parentForm._gotcha,
        });
        setStep('waitlistSuccess');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn't submit your details. Please try again or email hello@wivme.ai.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSchool = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await submitSchoolInquiry({
        schoolName: schoolForm.schoolName,
        contactPerson: schoolForm.contactPerson,
        role: schoolForm.role,
        email: schoolForm.email,
        phone: schoolForm.phone,
        city: schoolForm.city || undefined,
        board: schoolForm.board,
        studentCount: schoolForm.studentCount || undefined,
        message: schoolForm.message || undefined,
        _gotcha: schoolForm._gotcha,
      });
      setStep('schoolSuccess');
    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn't submit your inquiry. Please try again or email hello@wivme.ai.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateParent = <K extends keyof ParentForm>(key: K, value: ParentForm[K]) =>
    setParentForm((prev) => ({ ...prev, [key]: value }));

  const updateSchool = <K extends keyof SchoolForm>(key: K, value: SchoolForm[K]) =>
    setSchoolForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="audience-modal" role="dialog" aria-modal="true" aria-labelledby="audience-modal-title">
      <button
        type="button"
        className="audience-modal__backdrop"
        aria-label="Close modal"
        onClick={onClose}
      />

      <div ref={panelRef} className="audience-modal__panel">
        <button ref={closeButtonRef} type="button" className="audience-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {step === 'audience' && (
          <div className="audience-modal__content">
            <p className="label label--coral">
Pilot now open · Grade 8 · ICSE & CBSE
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Who are you here for?
            </h3>
            <p className="audience-modal__subtitle">
              Wivme is in pilot. Free this academic year for our founding parents.
              Full launch next academic year.
            </p>
            <div className="audience-modal__choices">
              <button type="button" className="btn btn--coral" onClick={() => setStep('parent')}>
                I&apos;m a Parent
              </button>
              <button type="button" className="btn btn--violet" onClick={() => setStep('school')}>
                I&apos;m a School
              </button>
            </div>
          </div>
        )}

        {step === 'parent' && (
          <div className="audience-modal__content">
            <p className="label label--coral">
Parent registration
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Tell us about your child.
            </h3>
            <p className="audience-modal__subtitle">
              {isPilotEligible ? (
                <>
                  <span className="audience-modal__price-strike">₹1,500/year</span>{' '}
                  <strong className="audience-modal__price-free">Free for founding parents.</strong>{' '}
                  We&apos;ll confirm by email.
                </>
              ) : parentForm.grade && parentForm.board ? (
                <>
                  Pilot is Grade 8 (ICSE/CBSE) only. We&apos;ll add you to the waitlist and
                  notify you when Grade {parentForm.grade} opens.
                </>
              ) : (
                <>Pick the grade and board to see if you qualify for the pilot.</>
              )}
            </p>

            <form className="audience-modal__form" onSubmit={submitParent}>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="parent-website">Website</label>
                <input
                  id="parent-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={parentForm._gotcha}
                  onChange={(e) => updateParent('_gotcha', e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Your name"
                value={parentForm.parentName}
                required
                onChange={(e) => updateParent('parentName', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={parentForm.email}
                required
                onChange={(e) => updateParent('email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={parentForm.phone}
                required
                onChange={(e) => updateParent('phone', e.target.value)}
              />
              <input
                type="text"
                placeholder="Student's name"
                value={parentForm.studentName}
                required
                onChange={(e) => updateParent('studentName', e.target.value)}
              />

              <div className="audience-modal__row">
                <select
                  value={parentForm.grade}
                  required
                  onChange={(e) => updateParent('grade', e.target.value)}
                >
                  <option value="" disabled>
                    Grade
                  </option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
                <select
                  value={parentForm.board}
                  required
                  onChange={(e) => updateParent('board', e.target.value)}
                >
                  <option value="" disabled>
                    Board
                  </option>
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="School name"
                value={parentForm.schoolName}
                onChange={(e) => updateParent('schoolName', e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                value={parentForm.city}
                onChange={(e) => updateParent('city', e.target.value)}
              />
              <select
                value={parentForm.source}
                onChange={(e) => updateParent('source', e.target.value)}
              >
                <option value="">How did you hear about us? (optional)</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {errorMsg && <p className="audience-modal__error">{errorMsg}</p>}

              <div className="audience-modal__actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setStep('audience')}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={isPilotEligible ? 'btn btn--coral' : 'btn btn--violet'}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting…'
                    : isPilotEligible
                      ? 'Register for pilot'
                      : 'Join waitlist'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'school' && (
          <div className="audience-modal__content">
            <p className="label label--violet">
Schools
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Tell us about your school.
            </h3>
            <p className="audience-modal__subtitle">
              We&apos;re onboarding pilot schools alongside families. A founder will personally
              reach out within 2 working days.
            </p>
            <form className="audience-modal__form" onSubmit={submitSchool}>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="school-website">Website</label>
                <input
                  id="school-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={schoolForm._gotcha}
                  onChange={(e) => updateSchool('_gotcha', e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="School name"
                value={schoolForm.schoolName}
                required
                onChange={(e) => updateSchool('schoolName', e.target.value)}
              />
              <div className="audience-modal__row">
                <input
                  type="text"
                  placeholder="Your name"
                  value={schoolForm.contactPerson}
                  required
                  onChange={(e) => updateSchool('contactPerson', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Your role"
                  value={schoolForm.role}
                  required
                  onChange={(e) => updateSchool('role', e.target.value)}
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={schoolForm.email}
                required
                onChange={(e) => updateSchool('email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={schoolForm.phone}
                required
                onChange={(e) => updateSchool('phone', e.target.value)}
              />
              <div className="audience-modal__row">
                <input
                  type="text"
                  placeholder="City"
                  value={schoolForm.city}
                  onChange={(e) => updateSchool('city', e.target.value)}
                />
                <select
                  value={schoolForm.board}
                  required
                  onChange={(e) => updateSchool('board', e.target.value)}
                >
                  <option value="" disabled>
                    Board
                  </option>
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Approx. number of students"
                value={schoolForm.studentCount}
                onChange={(e) => updateSchool('studentCount', e.target.value)}
              />
              <textarea
                placeholder="Anything we should know? (optional)"
                rows={3}
                value={schoolForm.message}
                onChange={(e) => updateSchool('message', e.target.value)}
              />

              {errorMsg && <p className="audience-modal__error">{errorMsg}</p>}

              <div className="audience-modal__actions">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setStep('audience')}
                  disabled={submitting}
                >
                  Back
                </button>
                <button type="submit" className="btn btn--violet" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send inquiry'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'pilotSuccess' && (
          <div className="audience-modal__content">
            <p className="label label--sage">
You&apos;re in
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Welcome aboard, founding parent.
            </h3>
            <p className="audience-modal__subtitle">
              Confirmation is on its way to your inbox. One of us will personally
              reach out within 2 working days to walk you through what happens next.
            </p>
            <div className="audience-modal__actions audience-modal__actions--center">
              <button type="button" className="btn btn--coral" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {step === 'waitlistSuccess' && (
          <div className="audience-modal__content">
            <p className="label label--sage">
You&apos;re on the list
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Thanks. We&apos;ll be in touch.
            </h3>
            <p className="audience-modal__subtitle">
              Right now the pilot is Grade 8 (ICSE/CBSE) only, so we can do it well.
              You&apos;ll be among the first to know when we open up Grade {parentForm.grade}.
            </p>
            <div className="audience-modal__actions audience-modal__actions--center">
              <button type="button" className="btn btn--violet" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {step === 'schoolSuccess' && (
          <div className="audience-modal__content">
            <p className="label label--sage">
Inquiry received
            </p>
            <h3 id="audience-modal-title" className="audience-modal__title">
              Thanks. We&apos;ll be in touch shortly.
            </h3>
            <p className="audience-modal__subtitle">
              A founder will personally reach out within 2 working days.
            </p>
            <div className="audience-modal__actions audience-modal__actions--center">
              <button type="button" className="btn btn--violet" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
