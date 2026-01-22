import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
    locale?: string
    currency?: string
    decimals?: number
  },
): string {
  const { locale = 'ru-RU', currency, decimals } = options || {}

  return new Intl.NumberFormat(locale, {
    ...(currency && {
      style: 'currency',
      currency: currency,
    }),
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  }).format(price)
}

/**
 * Returns Russian plural form for a word based on count
 * @param count - The count of items
 * @param singular - Word form for 1 (e.g., "вариант")
 * @param few - Word form for 2-4 (e.g., "варианта")
 * @param many - Word form for 5+ (e.g., "вариантов")
 * @returns Word form with proper Russian pluralization
 *
 * @example
 * getRussianPlural(1, "вариант", "варианта", "вариантов") // → "1 вариант"
 * getRussianPlural(2, "вариант", "варианта", "вариантов") // → "2 варианта"
 * getRussianPlural(5, "вариант", "варианта", "вариантов") // → "5 вариантов"
 */
export function getRussianPlural(
  count: number,
  singular: string,
  few: string,
  many: string,
): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} ${singular}`
  }
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return `${count} ${few}`
  }
  return `${count} ${many}`
}
