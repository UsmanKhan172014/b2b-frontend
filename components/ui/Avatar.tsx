import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/** Avatar diameter on the 8px scale. */
export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image URL. When omitted, `fallback` initials are shown. */
  src?: string;
  /** Accessible description for the avatar image. */
  alt: string;
  /** Initials shown when no image is provided. */
  fallback?: string;
  /** @default "md" */
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "size-8", text: "text-body-sm" },
  md: { container: "size-10", text: "text-body-sm" },
  lg: { container: "size-12", text: "text-body-base" },
};

/**
 * Circular profile avatar with glass border treatment from dashboard/header patterns.
 */
export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const { container, text } = sizeClasses[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-surface-container-high shadow-inner",
        container,
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover opacity-80 transition-opacity hover:opacity-100"
        />
      ) : (
        <span
          className={cn(
            "flex size-full items-center justify-center font-semibold text-on-surface",
            text,
          )}
          aria-hidden={!fallback}
        >
          {fallback ?? alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
