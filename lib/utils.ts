import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as price with thousands separator
 * @param price - The number to format
 * @param options - Optional formatting options
 * @returns Formatted price string
 *
 * @example
 * formatPrice(10000) // → "10 000" (Russian locale)
 * formatPrice(10000, { locale: 'en-US' }) // → "10,000"
 * formatPrice(10000, { currency: 'RUB' }) // → "10 000 ₽"
 * formatPrice(10000, { locale: 'en-US', currency: 'USD' }) // → "$10,000"
 */
export function formatPrice(
  price: number,
  options?: {
    locale?: string;
    currency?: string;
    decimals?: number;
  }
): string {
  const { locale = 'ru-RU', currency, decimals } = options || {};

  return new Intl.NumberFormat(locale, {
    ...(currency && {
      style: 'currency',
      currency: currency,
    }),
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(price);
}
