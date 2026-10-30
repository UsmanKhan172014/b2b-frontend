"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

import { GlassCard } from "@/components/ui";

interface AuthCardProps {
  children: ReactNode;
}

/**
 * Glass auth card with fade + scale entrance animation.
 */
export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <GlassCard
        elevation={2}
        className="flex w-full flex-col gap-6 rounded-2xl p-6 shadow-2xl shadow-black/50 sm:gap-8 sm:p-8 md:p-10"
      >
        {children}
      </GlassCard>
    </motion.div>
  );
}
