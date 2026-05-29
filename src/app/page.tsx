'use client';
import dynamic from 'next/dynamic';
import SmoothScroll from '@/components/SmoothScroll';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TheGap from '@/components/TheGap';
import MarqueeBand from '@/components/MarqueeBand';
import WhatWivmeDoes from '@/components/WhatWivmeDoes';
import WhoItsFor from '@/components/WhoItsFor';
import ThePilot from '@/components/ThePilot';
import WhyItWorks from '@/components/WhyItWorks';
import WhereItFits from '@/components/WhereItFits';
import CallToAction from '@/components/CallToAction';
import SiteFooter from '@/components/SiteFooter';
import GrainOverlay from '@/components/GrainOverlay';

/* Dynamic imports for purely client-side visual layers */
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), {
  ssr: false,
});
const ScrollProgress = dynamic(() => import('@/components/ScrollProgress'), {
  ssr: false,
});

export default function Home() {
  return (
    <SmoothScroll>
      <Navigation />
      <ScrollProgress />
      <CustomCursor />
      <main>
        <Hero />
        <TheGap />
        <MarqueeBand />
        <WhatWivmeDoes />
        <WhoItsFor />
        <ThePilot />
        <WhyItWorks />
        <WhereItFits />
        <CallToAction />
      </main>
      <SiteFooter />
      <GrainOverlay />
    </SmoothScroll>
  );
}
