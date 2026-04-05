/**
 * @description Custom class for handling API successful responses with a standardized structure
 */
class ApiResponse {
  /**
   * @description Creates a new ApiResponse instance
   * @param {number} statusCode - HTTP Status Code (e.g., 200, 201)
   * @param {any} data - The payload to send to the client
   * @param {string} [message='Success'] - A human-readable success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.status = `${statusCode}`.startsWith('2') ? 'success' : 'fail';
    this.statusCode = statusCode;
    this.message = message;
    this.data = data || null;
  }

  /**
   * @description Factory method for a standard 200 OK response
   * @param {any} data - The data payload to return
   * @param {string} [message='Request completed successfully'] - Optional message
   * @returns {ApiResponse}
   */
  static OK(data, message = 'Request completed successfully') {
    return new ApiResponse(200, data, message);
  }

  /**
   * @description Factory method for a 201 Created response
   * @param {any} data - The newly created resource
   * @param {string} [message='Resource created successfully'] - Optional message
   * @returns {ApiResponse}
   */
  static CREATED(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * @description Express middleware-friendly method to send the response directly
   * @param {import('express').Response} res - Express response object
   * @returns {import('express').Response}
   */
  send(res) {
    return res.status(this.statusCode).json({
      status: this.status,
      message: this.message,
      data: this.data,
      errors: null,
    });
  }
}

export default ApiResponse;
