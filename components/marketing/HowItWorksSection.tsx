"use client";

import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";

const steps = [
  {
    icon: "tune",
    accent: "text-primary",
    title: "Define ICP",
    description:
      "Input your ideal customer criteria. Specify industry, revenue, tech stack, and intent signals.",
  },
  {
    icon: "travel_explore",
    accent: "text-secondary",
    title: "AI Discovery",
    description:
      "Our autonomous agents continuously scan 100+ verified B2B data sources to surface exact matches.",
  },
  {
    icon: "auto_awesome",
    accent: "text-tertiary",
    title: "Enriched Outreach",
    description:
      "Get verified contact data immediately paired with AI-generated, hyper-personalized talking points.",
  },
] as const;

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/**
 * Three-step how-it-works grid with scroll-triggered staggered entrance.
 */
export function HowItWorksSection() {
  return (
    <section className="mb-16 sm:mb-24 lg:mb-32" id="how-it-works">
      <div className="mb-10 text-center sm:mb-16">
        <h2 className="mb-4 text-display-lg-mobile text-on-surface md:text-display-lg">
          Intelligence on Autopilot
        </h2>
        <p className="mx-auto max-w-2xl text-body-base text-on-surface-variant">
          Three steps to a pipeline that never sleeps. Our AI handles the heavy
          lifting of prospecting.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step) => (
          <motion.div key={step.title} variants={cardVariants}>
            <GlassCard className="group relative flex flex-col overflow-hidden rounded-2xl p-8 transition-colors hover:bg-surface-container-high/60">
              <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover:opacity-30">
                <MaterialIcon
                  name={step.icon}
                  className={`text-[100px] ${step.accent}`}
                />
              </div>
              <div className="z-10 mb-6 flex size-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-highest">
                <MaterialIcon name={step.icon} className={step.accent} />
              </div>
              <h3 className="z-10 mb-3 text-headline-md text-on-surface">
                {step.title}
              </h3>
              <p className="z-10 text-body-sm text-on-surface-variant">
                {step.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
