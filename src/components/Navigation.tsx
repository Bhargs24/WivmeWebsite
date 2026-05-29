'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAudienceModal } from './AudienceModalProvider';

type NavTheme = 'hero' | 'cream' | 'warm' | 'sage' | 'dark';
type NavLinkId = 'how' | 'who' | 'pilot' | 'why' | null;

const NAV_LINKS = [
  { href: '#how', label: 'How it works', id: 'how' as const },
  { href: '#who', label: "Who it's for", id: 'who' as const },
  { href: '#pilot', label: 'Pilot', id: 'pilot' as const, badge: true },
  { href: '#why', label: 'Why it works', id: 'why' as const },
];

function getThemeForElement(element: Element | null): NavTheme {
  if (!element) return 'hero';

  if (element.classList.contains('hero')) return 'hero';
  if (element.classList.contains('what-we-do')) return 'warm';
  if (element.classList.contains('where-it-fits')) return 'sage';
  if (element.classList.contains('who-its-for')) return 'dark';
  if (element.classList.contains('cta')) return 'dark';

  return 'cream';
}

function getLinkIdForElement(element: Element | null): NavLinkId {
  if (!element) return null;

  const id = element.getAttribute('id');
  return id === 'how' || id === 'who' || id === 'pilot' || id === 'why' ? id : null;
}

export default function Navigation() {
  const { openModal } = useAudienceModal();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<NavTheme>('hero');
  const [activeLink, setActiveLink] = useState<NavLinkId>(null);

  useEffect(() => {
    if (!isHomePage) {
      setTheme('warm');
      setActiveLink(null);
      setScrolled(window.scrollY > 60);

      const onScroll = () => {
        setScrolled(window.scrollY > 60);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScroll);
      };
    }

    const sections = Array.from(document.querySelectorAll('main > *'));

    const updateNav = () => {
      setScrolled(window.scrollY > 60);

      const probeY = Math.min(window.innerHeight * 0.18, 140);
      const activeSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
      });

      if (activeSection) {
        const nextTheme = getThemeForElement(activeSection);
        const nextLink = getLinkIdForElement(activeSection);

        setTheme((current) => (current === nextTheme ? current : nextTheme));
        setActiveLink((current) => (current === nextLink ? current : nextLink));
        return;
      }

      const nextSection = sections.find((section) => section.getBoundingClientRect().top > probeY);
      const lastSection = sections.length > 0 ? sections[sections.length - 1] : null;
      const fallbackSection = nextSection ?? lastSection;
      const fallbackTheme = getThemeForElement(fallbackSection);
      const fallbackLink = getLinkIdForElement(fallbackSection);

      setTheme((current) => (current === fallbackTheme ? current : fallbackTheme));
      setActiveLink((current) => (current === fallbackLink ? current : fallbackLink));
    };

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateNav();
        ticking = false;
      });
    };

    updateNav();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHomePage]);

  return (
    <nav className={`nav nav--${theme}${scrolled ? ' nav-scrolled' : ''}`}>
      <a href={isHomePage ? '#' : '/'} className="nav-logo">
        <span className="nav-logo-text">Wivme</span>
      </a>
      <div className="nav-links">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={isHomePage ? link.href : `/${link.href}`}
            className={`nav-link${activeLink === link.id ? ' nav-link--active' : ''}${link.badge ? ' nav-link--badge' : ''}`}
            aria-current={activeLink === link.id ? 'page' : undefined}
          >
            {link.label}
            {link.badge && <span className="nav-link__badge" aria-hidden />}
          </a>
        ))}
        <button type="button" className="nav-cta" onClick={() => openModal()}>Register</button>
      </div>
      <button type="button" className="nav-cta nav-cta-mobile" onClick={() => openModal()}>Get started</button>
    </nav>
  );
}
