'use client';

import { SessionProvider } from 'next-auth/react';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { SocketProvider } from '@/contexts/SocketContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
        <OnboardingModal />
      </SocketProvider>
    </SessionProvider>
  );
}
