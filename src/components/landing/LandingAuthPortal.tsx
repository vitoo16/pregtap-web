'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const AuthModal = dynamic(() => import('@/components/auth-modal').then((module) => module.AuthModal), {
  ssr: false,
});

type AuthMode = 'login' | 'register';

/** Kept in its own Suspense boundary so homepage content remains crawlable SSR HTML. */
export function LandingAuthPortal() {
  const params = useSearchParams();
  const requested: AuthMode | null = params.get('register') === 'true'
    ? 'register'
    : params.get('login') === 'true' ? 'login' : null;

  return requested ? <ActiveAuthModal key={requested} initialMode={requested} /> : null;
}

function ActiveAuthModal({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  return (
    <AuthModal
      isOpen
      mode={mode}
      onClose={() => router.replace('/', { scroll: false })}
      onModeChange={setMode}
      onSuccess={() => router.replace('/app')}
    />
  );
}
