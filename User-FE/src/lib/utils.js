import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Kết hợp nhiều class name và xử lý xung đột Tailwind CSS
 * @param  {...string} inputs - Danh sách các class name
 * @returns {string} - Class name đã được xử lý
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 