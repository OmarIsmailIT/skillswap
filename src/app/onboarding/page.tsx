import { OnboardingForm } from '@/components/onboarding/OnboardingForm';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome to SkillSwap!</h1>
        <p className="mt-4 text-lg text-gray-500">
          Let's get your profile set up so you can start exchanging skills.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
