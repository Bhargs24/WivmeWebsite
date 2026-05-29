import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <main className="contact-page">
        <section className="contact-hero">
          <div className="container contact-hero__inner">
            <p className="label label--coral">Talk to a founder</p>
            <h1 className="contact-hero__title">
              We pick up the phone.
            </h1>
            <p className="contact-hero__subtitle">
              Wivme is in its founding-parent phase. If you&apos;ve got a question,
              an idea, or want to know whether the pilot is right for your child,
              one of us answers personally.
            </p>
          </div>
        </section>

        <section className="contact-details">
          <div className="container contact-details__grid">
            <article className="contact-card contact-card--violet">
              <h2>Bhargav</h2>
              <p>Co-founder</p>
              <a href="mailto:bhargav@wivmeai.com">bhargav@wivmeai.com</a>
            </article>

            <article className="contact-card contact-card--coral">
              <h2>Anshu</h2>
              <p>Co-founder</p>
              <a href="mailto:anshu@wivmeai.com">anshu@wivmeai.com</a>
            </article>

            <article className="contact-card contact-card--sage">
              <h2>Phone</h2>
              <p>For schools &amp; press</p>
              <a href="tel:+918015620461">+91 80156 20461</a>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
