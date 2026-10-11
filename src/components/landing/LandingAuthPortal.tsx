'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@/lib/auth';

const AuthModal = dynamic(() => import('@/components/auth-modal').then((module) => module.AuthModal), {
  ssr: false,
});

type AuthMode = 'login' | 'register';

/** The modal JS only loads on the login/register URL, not on ordinary SEO landings. */
export function LandingAuthPortal() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true' || params.get('register') === 'true') {
      setMode(params.get('register') === 'true' ? 'register' : 'login');
      setOpen(true);
    }
  }, []);

  const close = () => {
    setOpen(false);
    window.history.replaceState(null, '', '/');
  };

  if (!open) return null;
  return (
    <AuthModal
      isOpen={open}
      mode={mode}
      onClose={close}
      onModeChange={setMode}
      onSuccess={(_response: AuthResponse) => router.replace('/app')}
    />
  );
}
