import { EXIT } from './exit-codes.js';

/**
 * Validate send request fields. Returns null if valid, or { code, error }.
 * @param {{ name?: string, phone?: string, message?: string }} input
 */
export function validateSendInput(input) {
  if (!input || typeof input !== 'object') {
    return { code: EXIT.USAGE, error: 'Request body must be a JSON object.' };
  }

  const { name, phone, message } = input;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { code: EXIT.USAGE, error: 'message is required and must be a non-empty string.' };
  }

  const hasName = name !== undefined && name !== null && String(name).trim() !== '';
  const hasPhone = phone !== undefined && phone !== null && String(phone).trim() !== '';

  if (!hasName && !hasPhone) {
    return {
      code: EXIT.USAGE,
      error: 'Provide either name or phone to identify the recipient.',
    };
  }

  if (hasName && hasPhone) {
    return {
      code: EXIT.USAGE,
      error: 'Provide name or phone, not both.',
    };
  }

  if (hasPhone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 7) {
      return { code: EXIT.USAGE, error: 'phone must contain at least 7 digits.' };
    }
  }

  return null;
}

/**
 * Normalize phone to digits-only for WhatsApp deep link.
 * @param {string} phone
 */
export function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '');
}
