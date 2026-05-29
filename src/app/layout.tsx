import type { Metadata } from 'next';
import { Inter, Instrument_Serif, Caveat } from 'next/font/google';
import { AudienceModalProvider } from '@/components/AudienceModalProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wivme.ai'),
  title: {
    default: 'Wivme · The Post-Class Memory System for K-12',
    template: '%s · Wivme',
  },
  description:
    '67% of new learning is forgotten by tomorrow morning. Wivme makes what your child actually remembers visible. Not just what was taught. Now in pilot for Grade 8 (ICSE & CBSE).',
  applicationName: 'Wivme',
  authors: [{ name: 'Bhargav Raghavendra' }, { name: 'Anshu' }],
  keywords: [
    'spaced repetition',
    'memory retention',
    'K-12',
    'ICSE',
    'CBSE',
    'student recall',
    'EdTech India',
    'forgetting curve',
    'Ebbinghaus',
    'school retention',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Wivme',
    title: 'Wivme · The Post-Class Memory System for K-12',
    description:
      'Schools measure what was taught. Wivme measures what your child actually remembers. Pilot now open for Grade 8 (ICSE & CBSE). Free for founding parents this academic year.',
    url: 'https://wivme.ai',
    locale: 'en_IN',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Wivme · 67% of new learning is gone by tomorrow morning. Pilot now open for Grade 8 (ICSE & CBSE).',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wivme · Memory you can finally see',
    description:
      '67% of new learning is gone by tomorrow. Wivme makes it stick, and lets you watch it happen.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${caveat.variable}`}
    >
      <body>
        <AudienceModalProvider>{children}</AudienceModalProvider>
      </body>
    </html>
  );
}
