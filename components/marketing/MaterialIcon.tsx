import { cn } from "@/lib/cn";

interface MaterialIconProps {
  /** Material Symbols icon name. */
  name: string;
  className?: string;
  /** Renders the filled variant. */
  filled?: boolean;
}

/**
 * Material Symbols Outlined icon matching Stitch export weight settings.
 */
export function MaterialIcon({ name, className, filled = false }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={
        filled
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
      }
      aria-hidden
    >
      {name}
    </span>
  );
}
