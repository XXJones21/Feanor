"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/**
 * Combines multiple class values into a single className string.
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind class conflicts.
 *
 * @example
 * cn("text-red-500", { "bg-blue-500": true, "p-4": false }, "m-2")
 * // => "text-red-500 bg-blue-500 m-2"
 */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
