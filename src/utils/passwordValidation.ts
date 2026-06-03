/**
 * Password validation utility.
 *
 * Rules:
 *  - At least 8 characters
 *  - At least 1 uppercase letter
 *  - At least 1 lowercase letter
 *  - At least 1 digit
 *  - At least 1 special character
 */

export interface PasswordValidationResult {
  valid: boolean;
  message: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one special character",
    };
  }
  return { valid: true, message: "" };
}

/**
 * Returns the first broken rule message, or empty string if valid.
 * This is a convenience alias for inline use.
 */
export function getPasswordError(password: string): string {
  const result = validatePassword(password);
  return result.valid ? "" : result.message;
}
