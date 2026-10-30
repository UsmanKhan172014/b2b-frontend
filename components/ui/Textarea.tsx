import { type TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const fieldClasses =
  "w-full resize-y rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-4 font-sans text-body-base text-on-surface transition-all placeholder:text-on-surface-variant/50 hover:border-outline-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50";

/**
 * Multi-line dark recessed field with primary indigo focus treatment.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(fieldClasses, className)}
        {...props}
      />
    );
  },
);
