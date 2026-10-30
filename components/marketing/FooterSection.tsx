import { MaterialIcon } from "@/components/marketing/MaterialIcon";

/**
 * Site footer with brand, navigation links, and copyright.
 */
export function FooterSection() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-surface-container-lowest/80 px-margin-mobile py-10 backdrop-blur-md sm:py-12 md:px-margin-desktop">
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-2">
          <MaterialIcon name="psychology" className="text-xl text-primary" filled />
          <span className="text-body-base font-semibold text-on-surface opacity-80">
            LeadScope AI
          </span>
        </div>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Product
          </a>
          <a
            href="#"
            className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Company
          </a>
          <a
            href="#"
            className="text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            Resources
          </a>
        </div>
        <div className="text-body-sm text-on-surface-variant opacity-50">
          © 2024 LeadScope AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
