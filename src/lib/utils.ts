import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges CSS class names using `clsx` and `tailwind-merge`.
 *
 * Combines multiple class values (strings, arrays, objects) and intelligently
 * resolves Tailwind CSS class conflicts.
 *
 * @param inputs - Class values to merge
 * @returns The merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
