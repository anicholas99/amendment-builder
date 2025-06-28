/**
 * Validation and sanitization utilities to prevent injection attacks
 */

/**
 * Sanitizes a string input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;

  // Simple email regex - could be expanded for more strict validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates a strong password
 * @param password Password to validate
 * @returns Boolean indicating if password meets requirements
 */
export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;

  // Check for at least one uppercase, one lowercase, one number, and one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Validates and sanitizes form input data
 * @param data Object containing form data
 * @param schema Validation schema describing expected fields and types
 * @returns Object with sanitized data and validation errors
 */
export function validateFormData<T>(
  data: Record<string, unknown>,
  schema: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'email' | 'password';
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    }
  >
): { data: Partial<T>; errors: Record<string, string> } {
  const sanitizedData: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  // Loop through each field in the schema
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];

    // Check if required field is missing
    if (
      rules.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors[field] = `${field} is required`;
      return;
    }

    // Skip optional fields that are not provided
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Type validation and sanitization
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors[field] = `${field} must be a string`;
          return;
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors[field] =
            `${field} must be at least ${rules.minLength} characters`;
          return;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] =
            `${field} must be no more than ${rules.maxLength} characters`;
          return;
        }

        sanitizedData[field] = sanitizeString(value);
        break;

      case 'email':
        if (typeof value !== 'string') {
          errors[field] = `${field} must be a string`;
          return;
        }

        if (!isValidEmail(value)) {
          errors[field] = `${field} must be a valid email address`;
          return;
        }

        sanitizedData[field] = value.trim().toLowerCase();
        break;

      case 'password':
        if (typeof value !== 'string') {
          errors[field] = `${field} must be a string`;
          return;
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors[field] =
            `${field} must be at least ${rules.minLength} characters`;
          return;
        }

        if (!isStrongPassword(value) && rules.required) {
          errors[field] =
            `${field} must include uppercase, lowercase, number, and special character`;
          return;
        }

        sanitizedData[field] = value;
        break;

      case 'number':
        const num = Number(value);

        if (isNaN(num)) {
          errors[field] = `${field} must be a number`;
          return;
        }

        if (rules.min !== undefined && num < rules.min) {
          errors[field] = `${field} must be at least ${rules.min}`;
          return;
        }

        if (rules.max !== undefined && num > rules.max) {
          errors[field] = `${field} must be no more than ${rules.max}`;
          return;
        }

        sanitizedData[field] = num;
        break;

      case 'boolean':
        sanitizedData[field] = Boolean(value);
        break;

      default:
        errors[field] = `Invalid type for ${field}`;
        break;
    }
  });

  return { data: sanitizedData as Partial<T>, errors };
}
