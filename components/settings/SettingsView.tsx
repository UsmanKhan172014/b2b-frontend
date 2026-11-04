"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { LinkedInTab } from "@/components/settings/LinkedInTab";
import { PlanUsageTab } from "@/components/settings/PlanUsageTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import type { SettingsTabId, SettingsUserProfile } from "@/lib/settings/types";

interface SettingsViewProps {
  profile: SettingsUserProfile;
}

export function SettingsView({ profile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

  return (
    <div className="mx-auto w-full max-w-container-max">
      <div className="mb-8">
        <h1 className="text-display-lg-mobile tracking-tight text-on-surface md:text-display-lg">
          Settings
        </h1>
        <p className="mt-2 text-body-base text-on-surface-variant">
          Manage your profile, plan and security.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile" ? <ProfileTab profile={profile} /> : null}
          {activeTab === "linkedin" ? <LinkedInTab /> : null}
          {activeTab === "plan" ? <PlanUsageTab /> : null}
          {activeTab === "security" ? <SecurityTab email={profile.email} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
