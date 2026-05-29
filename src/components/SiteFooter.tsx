import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">Wivme</span>
          <span className="site-footer__tag">
            The post-class memory system for K-12.
          </span>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          <Link href="/#how">How it works</Link>
          <Link href="/#pilot">Pilot</Link>
          <Link href="/#why">Why it works</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="site-footer__meta">
          <span>&copy; {year} Wivme</span>
        </div>
      </div>
    </footer>
  );
}
