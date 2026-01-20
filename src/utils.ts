import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
