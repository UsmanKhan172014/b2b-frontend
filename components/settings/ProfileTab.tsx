"use client";

import { type ReactNode, useState } from "react";

import { MaterialIcon } from "@/components/marketing/MaterialIcon";
import { Avatar, Button, GlassCard, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { SettingsUserProfile } from "@/lib/settings/types";
import { cn } from "@/lib/cn";

interface ProfileTabProps {
  profile: SettingsUserProfile;
}

function SettingsFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-label-mono uppercase text-on-surface-variant"
    >
      {children}
    </label>
  );
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [role, setRole] = useState(profile.role);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  function handleCancel() {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setRole(profile.role);
    setMessage(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: [firstName, lastName].filter(Boolean).join(" "),
        role,
      },
    });

    setIsSaving(false);
    setMessage(error ? error.message : "Profile updated successfully.");
  }

  return (
    <GlassCard radius="section" className="max-w-3xl p-6 sm:p-8">
      <h3 className="mb-6 flex items-center gap-2 text-headline-md text-on-surface">
        <MaterialIcon name="person" className="text-primary" />
        Personal Information
      </h3>

      <div className="mb-8 border-t border-white/10 pt-6">
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-4">
            <div className="group relative cursor-pointer">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.email || "User avatar"}
                fallback={initials || "U"}
                size="lg"
                className="size-24 border-2 border-white/10 text-headline-md group-hover:border-primary/50"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <MaterialIcon name="photo_camera" className="text-white" />
              </div>
            </div>
            <button
              type="button"
              className="text-body-sm text-primary transition-colors hover:text-secondary"
            >
              Change Avatar
            </button>
          </div>

          <div className="w-full flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <SettingsFieldLabel htmlFor="first-name">First Name</SettingsFieldLabel>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <SettingsFieldLabel htmlFor="last-name">Last Name</SettingsFieldLabel>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <SettingsFieldLabel htmlFor="email">Email Address</SettingsFieldLabel>
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="text-on-surface-variant"
              />
              <p className="text-body-sm text-on-surface-variant/70">
                Contact support to change your primary email.
              </p>
            </div>

            <div className="space-y-2">
              <SettingsFieldLabel htmlFor="role">Job title</SettingsFieldLabel>
              <Input
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {message ? (
        <p
          className={cn(
            "mb-4 text-body-sm",
            message.includes("success") ? "text-secondary" : "text-error",
          )}
        >
          {message}
        </p>
      ) : null}

      <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </GlassCard>
  );
}
