"use client";

import { motion } from "framer-motion";

import { Badge, Button, GlassCard } from "@/components/ui";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";

interface PricingTier {
  name: string;
  price: string;
  priceSuffix?: string;
  features: { label: string; included: boolean; emphasized?: boolean }[];
  cta: string;
  variant: "ghost" | "primary";
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$0",
    priceSuffix: "/mo",
    features: [
      { label: "5 Leads / month", included: true },
      { label: "Basic Enrichment", included: true },
      { label: "Custom Integrations", included: false },
    ],
    cta: "Get Started",
    variant: "ghost",
  },
  {
    name: "Pro",
    price: "$99",
    priceSuffix: "/mo",
    features: [
      { label: "100 Leads / month", included: true, emphasized: true },
      { label: "Advanced Deep Enrichment", included: true, emphasized: true },
      { label: "CRM Integrations", included: true, emphasized: true },
      { label: "AI Talking Points", included: true, emphasized: true },
    ],
    cta: "Start Free Trial",
    variant: "primary",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      { label: "Unlimited Leads", included: true },
      { label: "Dedicated Data Models", included: true },
      { label: "Dedicated Account Manager", included: true },
    ],
    cta: "Contact Sales",
    variant: "ghost",
  },
];

/**
 * Pricing tier cards with hover-lift interaction on scroll-visible grid.
 */
export function PricingSection() {
  return (
    <section className="mb-16 sm:mb-24" id="pricing">
      <div className="mb-10 text-center sm:mb-16">
        <h2 className="mb-4 text-display-lg-mobile text-on-surface md:text-display-lg">
          Simple, Transparent Pricing
        </h2>
        <p className="mx-auto max-w-2xl text-body-base text-on-surface-variant">
          Scale your pipeline without scaling your SDR headcount.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            className={tier.highlighted ? "relative z-10 md:-translate-y-4" : ""}
          >
            <GlassCard
              elevation={tier.highlighted ? 2 : 1}
              glow={tier.highlighted}
              className={`flex h-full flex-col justify-between rounded-2xl p-8 transition-shadow duration-300 hover:shadow-elevated ${
                tier.highlighted
                  ? "border-primary/50 shadow-glow-primary-sm"
                  : ""
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge
                    status="primary"
                    className="rounded-full bg-primary px-3 py-1 font-bold text-on-primary-fixed normal-case"
                  >
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-headline-md text-on-surface">
                  {tier.name}
                </h3>
                <div className="mb-6 flex items-baseline gap-2">
                  <span
                    className={
                      tier.price === "Custom"
                        ? "text-headline-md text-on-surface"
                        : "text-display-lg-mobile text-on-surface"
                    }
                  >
                    {tier.price}
                  </span>
                  {tier.priceSuffix && (
                    <span className="text-body-sm text-on-surface-variant">
                      {tier.priceSuffix}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.label}
                      className={`flex items-center gap-3 text-body-sm ${
                        feature.included
                          ? feature.emphasized
                            ? "text-on-surface"
                            : "text-on-surface-variant"
                          : "text-outline"
                      }`}
                    >
                      <MaterialIcon
                        name={feature.included ? "check" : "close"}
                        className={`text-lg ${
                          feature.included ? "text-primary" : "text-outline"
                        }`}
                      />
                      {feature.label}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={tier.variant}
                fullWidth
                className={
                  tier.variant === "primary"
                    ? "font-medium shadow-glow-primary"
                    : "font-medium"
                }
              >
                {tier.cta}
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
