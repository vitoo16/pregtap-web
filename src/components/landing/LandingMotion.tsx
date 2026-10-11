'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

/** Progressive enhancement only: content is visible without JS and to reduced-motion visitors. */
export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const element = root.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = element.querySelectorAll<HTMLElement>('[data-hero-reveal]');
      if (hero.length) {
        gsap.fromTo(hero,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.11, ease: 'power2.out', clearProps: 'all' }
        );
      }

      element.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => {
        gsap.fromTo(item,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out',
            clearProps: 'all',
            scrollTrigger: { trigger: item, start: 'top 88%', once: true },
          }
        );
      });

      // One inexpensive decorative tween, not an endlessly running animation on each card.
      const floating = element.querySelector<HTMLElement>('[data-float]');
      if (floating) {
        gsap.to(floating, { y: -9, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
    }, element);

    return () => media.revert();
  }, { scope: root });

  return <main ref={root} id="main-content" className="min-h-screen overflow-x-clip">{children}</main>;
}
