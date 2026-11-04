import type { Metadata } from "next";

import { FooterSection } from "@/components/marketing/FooterSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PricingSection } from "@/components/marketing/PricingSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sales Copilot - The AI Agent for High-Velocity Sales Teams",
  description:
    "Sales Copilot finds, enriches, and prioritizes your ideal prospects while you sleep. Stop searching, start closing.",
};

export default async function MarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden font-sans text-body-base antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] size-1/2 rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] size-[40%] rounded-full bg-secondary-container/10 blur-[120px]" />
      </div>

      <MarketingNav isAuthenticated={isAuthenticated} />

      <main className="mx-auto w-full max-w-container-max flex-grow px-6 pt-24 pb-16 sm:px-margin-mobile sm:pt-28 sm:pb-20 md:px-margin-desktop md:pt-32 md:pb-24">
        <HeroSection isAuthenticated={isAuthenticated} />
        <SocialProofSection />
        <HowItWorksSection />
        <PricingSection />
      </main>

      <FooterSection />
    </div>
  );
}
