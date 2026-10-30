"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Avatar, Badge, Button, GlassCard } from "@/components/ui";
import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { ShaderBackground } from "@/components/marketing/ShaderBackground";

const SARAH_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYgwDuJA2u-pC087M2Eh6zOjS22P2NO0kblSNf_SdLxv3toxhjDzAPAdLw3Ip-ZvBGqFTxwRnjo1o_puK7fGC-vJzbDFuznuL8XvphZkkIpKdGuR8k_3XW83Lk1rfNJc6rEHr-X-e4Wizw_UdI4jTX_ZUbnrIW_p2BEEAmvVcliHMwDL8QJu7w7bCGh7E35xw-djWVK1d_sVlFAYu2QsgeUUvEgChMC0_6vqiDqM6viPSkVd-3E61f08ejxyFfMImYKRjYtsVnkms";

const DAVID_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA1esd0zZUy_bvJdfz-A7sK5LWgWJl9EsButCc2fAHMNw0dtuYmiud8X49YWdcxw5Q6gaNvXKLl9RfR-i6M4KEPL7nLQnXqJocQuEJBOmjv5dyZbfP34LiCVGtiMSbVzoiyqTb_fzOAGovN-_wSft5TVGT_JbLuQbp-SIikTK3nEBKHbEO8CQIL9meKoUQcQNrtooyX-ruy9Vtzzy1nZwFQwHoCwtuvMgImEQ-3nKItwzhs0VshmjGNHrkUoqqY22edrse-R6qJCxE";

/**
 * Hero section with shader background, headline, CTAs, and dashboard mockup.
 */
export function HeroSection() {
  return (
    <section className="relative mb-16 flex flex-col items-center gap-8 sm:mb-24 sm:gap-12 lg:mb-32 lg:flex-row lg:gap-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <ShaderBackground className="opacity-40" />
        <div className="absolute inset-0 bg-canvas/70" />
        <div className="absolute top-[-20%] left-[-10%] size-1/2 rounded-full bg-primary-container/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] size-[40%] rounded-full bg-secondary-container/10 blur-[120px]" />
      </div>

      <motion.div
        className="z-10 flex-1 space-y-8"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <h1 className="text-balance text-display-lg-mobile leading-tight text-on-surface md:text-display-lg">
          The AI Agent for <br />
          <span className="gradient-text">High-Velocity</span> Sales Teams
        </h1>
        <p className="max-w-xl text-base text-body-base text-on-surface-variant sm:text-lg">
          LeadScope AI finds, enriches, and prioritizes your ideal prospects
          while you sleep. Stop searching, start closing.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="font-medium shadow-glow-primary hover:-translate-y-0.5 hover:shadow-glow-secondary sm:w-auto"
            >
              Start Free Trial
              <MaterialIcon name="arrow_forward" className="text-lg" />
            </Button>
          </Link>
          <Button variant="ghost" size="lg" className="w-full font-medium sm:w-auto">
            Book a Demo
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="relative min-w-0 w-full max-w-2xl flex-1 lg:max-w-none"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeOut", delay: 0.15 }}
      >
        <GlassCard
          elevation={2}
          className="group relative aspect-[4/3] w-full rotate-0 overflow-hidden rounded-2xl transition-transform duration-700 ease-out md:rotate-2 md:hover:rotate-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-high/50 to-surface-container-lowest/50" />
          <div className="absolute inset-0 flex flex-col gap-3 p-4 opacity-80 transition-opacity duration-500 group-hover:opacity-100 sm:gap-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 sm:pb-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary-container">
                  <MaterialIcon
                    name="person_search"
                    className="text-sm text-on-primary-container"
                    filled
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-body-sm font-semibold text-on-surface">
                    Active Campaign
                  </h3>
                  <p className="truncate font-mono text-[10px] text-label-mono text-primary sm:text-label-mono">
                    ENTERPRISE SAAS DIRECTORS
                  </p>
                </div>
              </div>
              <Badge
                status="secondary"
                glow
                className="shrink-0 rounded-full px-2 py-1 text-[10px] normal-case sm:px-3 sm:text-label-mono"
              >
                <span className="mr-1 size-2 animate-pulse rounded-full bg-secondary shadow-glow-secondary-sm" />
                RUNNING
              </Badge>
            </div>

            <div className="mt-2 space-y-3">
              <GlassCard className="flex min-w-0 items-center justify-between gap-2 p-2.5 sm:p-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <Avatar
                    src={SARAH_AVATAR}
                    alt="Sarah Jenkins"
                    size="md"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-body-sm font-medium text-on-surface">
                      Sarah Jenkins
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      VP Sales @ Vercel
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 font-mono text-xs text-tertiary sm:flex">
                  <MaterialIcon name="bolt" className="text-sm" />
                  98% MATCH
                </span>
              </GlassCard>

              <GlassCard className="flex min-w-0 items-center justify-between gap-2 p-2.5 sm:p-3">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <Avatar src={DAVID_AVATAR} alt="David Chen" size="md" />
                  <div className="min-w-0">
                    <h4 className="truncate text-body-sm font-medium text-on-surface">
                      David Chen
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Director Ops @ Linear
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1 font-mono text-xs text-tertiary sm:flex">
                  <MaterialIcon name="bolt" className="text-sm" />
                  95% MATCH
                </span>
              </GlassCard>

              <GlassCard className="flex items-center justify-between p-3 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-surface-container-highest">
                    <MaterialIcon
                      name="person"
                      className="text-on-surface-variant"
                    />
                  </div>
                  <div>
                    <div className="mb-1 h-4 w-24 animate-pulse rounded bg-surface-variant" />
                    <div className="h-3 w-32 animate-pulse rounded bg-surface-variant" />
                  </div>
                </div>
                <div className="h-3 w-16 animate-pulse rounded bg-surface-variant" />
              </GlassCard>
            </div>
          </div>

          <div className="absolute -top-4 -right-4 size-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 size-32 rounded-full bg-secondary/20 blur-2xl" />
        </GlassCard>
      </motion.div>
    </section>
  );
}
