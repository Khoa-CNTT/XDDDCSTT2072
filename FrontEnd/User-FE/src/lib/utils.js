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

/**
 * Format date function that handles invalid date strings
 * @param {string} dateString - The date string to format
 * @param {boolean} includeTime - Whether to include time in the formatted date
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return "N/A";
  
  // Try to create a date object
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  try {
    // Format the date
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit"
      })
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Format date with custom fallback for invalid dates
 * @param {string} dateString - The date string to format
 * @param {string} fallback - The fallback string to return if date is invalid
 * @returns {string} Formatted date string or fallback
 */
export const formatDateWithFallback = (dateString, fallback = "N/A") => {
  if (!dateString) return fallback;
  
  // Try to create a date object
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return fallback;
  }

  try {
    // Format the date
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return fallback;
  }
};

/**
 * Format date to date only (no time)
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string (date only)
 */
export const formatDateOnly = (dateString) => {
  return formatDate(dateString, false);
}; 