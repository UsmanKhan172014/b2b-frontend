"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import type { SettingsTabId } from "@/lib/settings/types";
import { cn } from "@/lib/cn";

const TABS: { id: SettingsTabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "api", label: "API Usage" },
  { id: "billing", label: "Billing" },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<SettingsTabId, HTMLButtonElement>>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    const container = containerRef.current;
    if (!activeButton || !container) return;

    setIndicator({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    function updateIndicator() {
      const activeButton = tabRefs.current[activeTab];
      if (!activeButton) return;
      setIndicator({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }

    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative mb-8 border-b border-white/10">
      <div ref={containerRef} className="flex gap-6 sm:gap-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[tab.id] = element ?? undefined;
            }}
            type="button"
            className={cn(
              "relative z-10 pb-4 text-base font-semibold transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        className="absolute bottom-0 h-0.5 bg-primary"
        animate={{ left: indicator.left, width: indicator.width }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
      />
    </div>
  );
}
