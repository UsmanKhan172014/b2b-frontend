"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ApiUsageTab } from "@/components/settings/ApiUsageTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { ProfileTab } from "@/components/settings/ProfileTab";
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
          Manage your account, API access, and billing preferences.
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
          {activeTab === "api" ? <ApiUsageTab /> : null}
          {activeTab === "billing" ? <BillingTab /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
