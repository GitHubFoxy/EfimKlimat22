/**
 * Input validation utilities for Convex functions
 * Provides consistent validation across all mutations/queries
 */

// === NUMERIC VALIDATION ===

export function validatePrice(price: number, fieldName = 'Price'): void {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    throw new Error(`${fieldName} must be a valid number`)
  }
  if (price < 0) {
    throw new Error(`${fieldName} cannot be negative`)
  }
  if (price > 99_999_999) {
    throw new Error(`${fieldName} exceeds maximum (99,999,999)`)
  }
}

export function validateQuantity(
  quantity: number,
  fieldName = 'Quantity',
): void {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    throw new Error(`${fieldName} must be a valid number`)
  }
  if (!Number.isInteger(quantity)) {
    throw new Error(`${fieldName} must be an integer`)
  }
  if (quantity < 0) {
    throw new Error(`${fieldName} cannot be negative`)
  }
  if (quantity > 999_999) {
    throw new Error(`${fieldName} exceeds maximum (999,999)`)
  }
}

export function validateCartQuantity(
  quantity: number,
  fieldName = 'Quantity',
): void {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    throw new Error(`${fieldName} must be a valid number`)
  }
  if (!Number.isInteger(quantity)) {
    throw new Error(`${fieldName} must be an integer`)
  }
  if (quantity < 1) {
    throw new Error(`${fieldName} must be at least 1`)
  }
  if (quantity > 99) {
    throw new Error(`${fieldName} exceeds maximum (99)`)
  }
}

export function validateCartQuantityUpdate(
  quantity: number,
  fieldName = 'Quantity',
): void {
  if (quantity === 0) {
    return
  }
  validateCartQuantity(quantity, fieldName)
}

export function validatePageNumber(pageNum: number): void {
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    throw new Error('Page number must be a positive integer')
  }
  if (pageNum > 10_000) {
    throw new Error('Page number exceeds maximum')
  }
}

export function validatePageSize(pageSize: number): void {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error('Page size must be a positive integer')
  }
  if (pageSize > 100) {
    throw new Error('Page size exceeds maximum (100)')
  }
}

// === STRING VALIDATION ===

export function validateStringLength(
  value: string,
  maxLength: number,
  fieldName: string,
): void {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length (${maxLength})`)
  }
}

export function validateNonEmptyString(value: string, fieldName: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty`)
  }
}

export function validateName(name: string, fieldName = 'Name'): void {
  validateNonEmptyString(name, fieldName)
  validateStringLength(name, 255, fieldName)
}

export function validateSku(sku: string): void {
  validateNonEmptyString(sku, 'SKU')
  validateStringLength(sku, 100, 'SKU')
}

export function validateDescription(description: string): void {
  validateStringLength(description, 10_000, 'Description')
}

export function validateSessionId(sessionId: string): void {
  validateNonEmptyString(sessionId, 'Session ID')
  validateStringLength(sessionId, 255, 'Session ID')
}

export function validateSearchQuery(query: string): void {
  validateStringLength(query, 500, 'Search query')
}

// === CONTACT VALIDATION ===

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/

export function validateEmail(
  email: string | undefined,
  required = false,
): void {
  if (!email) {
    if (required) {
      throw new Error('Email is required')
    }
    return
  }

  if (email.length > 254) {
    throw new Error('Email exceeds maximum length')
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format')
  }
}

export function validatePhone(phone: string): void {
  validateNonEmptyString(phone, 'Phone')

  if (phone.length > 20) {
    throw new Error('Phone exceeds maximum length')
  }

  if (!PHONE_REGEX.test(phone)) {
    throw new Error('Invalid phone format')
  }
}

// === PASSWORD VALIDATION ===

export function validatePassword(password: string): void {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  if (password.length > 128) {
    throw new Error('Password exceeds maximum length')
  }
}

// === ADDRESS VALIDATION ===

export function validateAddress(
  address:
    | { city: string; street: string; details?: string | undefined }
    | undefined,
  required = false,
): void {
  if (!address) {
    if (required) {
      throw new Error('Address is required')
    }
    return
  }

  validateNonEmptyString(address.city, 'City')
  validateStringLength(address.city, 100, 'City')

  validateNonEmptyString(address.street, 'Street')
  validateStringLength(address.street, 255, 'Street')

  if (address.details) {
    validateStringLength(address.details, 500, 'Address details')
  }
}

// === COLLECTION VALIDATION ===

export function validateCollection(collection: string | undefined): void {
  if (collection !== undefined) {
    validateStringLength(collection, 255, 'Collection')
  }
}

// === MESSAGE/COMMENT VALIDATION ===

export function validateMessage(
  message: string | undefined,
  fieldName = 'Message',
): void {
  if (message !== undefined) {
    validateStringLength(message, 2000, fieldName)
  }
}

// === ORDER VALIDATION ===

export function validateDeliveryPrice(price: number): void {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    throw new Error('Delivery price must be a valid number')
  }
  if (price < 0) {
    throw new Error('Delivery price cannot be negative')
  }
  if (price > 999_999) {
    throw new Error('Delivery price exceeds maximum')
  }
}

// === LIMIT VALIDATION ===

export function validateLimit(limit: number | undefined, max = 100): void {
  if (limit === undefined) return
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Limit must be a positive integer')
  }
  if (limit > max) {
    throw new Error(`Limit exceeds maximum (${max})`)
  }
}

// === CURSOR VALIDATION ===

export function validateCursor(cursor: number | undefined): void {
  if (cursor === undefined) return
  if (!Number.isInteger(cursor) || cursor < 0) {
    throw new Error('Cursor must be a non-negative integer')
  }
}
