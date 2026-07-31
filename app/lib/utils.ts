/**
 * cn utility
 * Minimal className combiner (keeps the project dependency-free).
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
