import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values into a single className string.
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind class conflicts.
 * 
 * @example
 * cn("text-red-500", { "bg-blue-500": true, "p-4": false }, "m-2")
 * // => "text-red-500 bg-blue-500 m-2"
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
} 