import { MaterialIcon } from "@/components/marketing/MaterialIcon";

/**
 * Social proof logo strip between hero and how-it-works sections.
 */
export function SocialProofSection() {
  return (
    <section className="relative mb-16 border-y border-white/5 py-8 sm:mb-24 sm:py-12 lg:mb-32">
      <div className="absolute inset-0 bg-gradient-to-r from-surface/0 via-surface-container-high/20 to-surface/0" />
      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-8 text-center font-mono text-label-mono tracking-widest text-on-surface-variant uppercase">
          Trusted by innovative sales teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 sm:gap-12 md:gap-24">
          <span className="text-headline-md font-bold tracking-tighter text-on-surface">
            VERCEL
          </span>
          <span className="flex items-center gap-1 text-headline-md font-bold tracking-tighter text-on-surface">
            <MaterialIcon name="horizontal_rule" />
            Linear
          </span>
          <span className="text-headline-md font-bold tracking-tighter text-on-surface italic">
            RETOOL
          </span>
        </div>
      </div>
    </section>
  );
}
