import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PopularSkills } from '@/components/landing/PopularSkills';
import { CommunityStats } from '@/components/landing/CommunityStats';
import { Testimonials } from '@/components/landing/Testimonials';
import { CallToAction } from '@/components/landing/CallToAction';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <PopularSkills />
      <CommunityStats />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
