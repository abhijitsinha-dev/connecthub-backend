/**
 * @description Custom error class for handling API errors with a standardized structure
 * @typedef {Object} ApiSubError
 * @property {string | number} field - The key or path where the error occurred
 * @property {string} constraint - The type of constraint violated (e.g., 'REQUIRED', 'UNIQUE')
 * @property {string} message - A human-readable error message
 */

class ApiError extends Error {
  /**
   * @description Creates a new ApiError instance with a standardized structure for API error responses
   * @param {number} statusCode - HTTP Status Code (e.g., 400, 404, 500)
   * @param {string} [message='Something went wrong'] - Error message
   * @param {ApiSubError[]} [errors=[]] - Array of specific validation errors
   */
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errors = errors;
    this.data = null;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * @description Factory method for creating a 409 Conflict error when a unique constraint is violated
   * @param {string} field - The database field that caused the conflict (e.g., 'email')
   * @returns {ApiError} - A new instance of ApiError
   */
  static CONFLICT(field) {
    const message = `${field} already exists`;
    return new ApiError(409, message, [
      {
        field,
        constraint: 'unique',
        message: `${field} already exists`,
      },
    ]);
  }

  /**
   * @description Factory method for creating a 404 Not Found error when a resource is not found
   * @param {string} field - The database field that was not found (e.g., 'userId')
   * @returns {ApiError} - A new instance of ApiError
   */
  static NOT_FOUND(field) {
    const message = `${field} not found`;
    return new ApiError(404, message, [
      {
        field,
        constraint: 'not-found',
        message,
      },
    ]);
  }

  static UNAUTHORIZED(message = 'Unauthorized') {
    return new ApiError(401, message, [
      {
        field: 'authentication',
        constraint: 'unauthorized',
        message,
      },
    ]);
  }
}

export default ApiError;
