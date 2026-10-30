import { clsx, type ClassValue } from "clsx";

/**
 * Merges class names for conditional component styling.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
