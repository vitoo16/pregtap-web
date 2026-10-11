'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP);

/** Shared scoped GSAP entrance for the app home cards. */
export function useCardReveal<T extends HTMLElement>(index = 0, baseDelay = 0.1) {
  const card = useRef<T>(null);

  useGSAP(() => {
    const element = card.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.4, delay: baseDelay + index * 0.08, ease: 'power2.out', clearProps: 'all' }
      );
    }, element);
    return () => media.revert();
  }, { scope: card, dependencies: [baseDelay, index], revertOnUpdate: true });

  return card;
}
