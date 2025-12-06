'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OnboardingForm } from './OnboardingForm';
import { Button } from '@/components/ui/Button';

export const OnboardingModal = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    if (session?.user && session.user.onBoardingCompleted === false) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [session]);

  const handleSkip = async () => {
    setSkipping(true);
    setIsOpen(false); // Close the modal immediately

    try {
      // Call API to mark onboarding as completed without data
      const res = await fetch('/api/users/me/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        // Force session refresh to get updated onBoardingCompleted status
        await update();
      } else {
        console.error('Failed to skip onboarding on server', await res.text());
      }
    } catch (error) {
      console.error('Failed to skip onboarding due to network error', error);
    } finally {
      setSkipping(false);
    }
  };

  const handleSuccess = async () => {
    setIsOpen(false);
    // Force session refresh to get updated onBoardingCompleted status and avatar
    await update();
    // Force router refresh to re-render components with new session data
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-visible animate-scale-in">
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            isLoading={skipping}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium px-3 py-2 rounded-lg"
          >
            Skip for now
          </Button>
        </div>

        <div className="p-6">
          <OnboardingForm
            onSuccess={handleSuccess}
            className="border-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
};
