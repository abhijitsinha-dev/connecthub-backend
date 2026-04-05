import jwt from 'jsonwebtoken';
import ApiError from './ApiError.js';

/**
 * @description Generates a JWT for an authenticated user
 * @param {string| import('mongoose').Schema.Types.ObjectId} id - The database ID of the user
 * @returns {string} The signed JWT
 */
const generateAuthToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * @description Verifies a JWT and returns the decoded payload if valid
 * @param {string} token - The JWT to verify
 * @throws {import('./ApiError.js').ApiError} Throws an ApiError with 401 status if the token is invalid or expired
 * @returns {object} The decoded token payload if valid, or null if invalid
 */
const verifyJWT = token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (_err) {
    throw ApiError.UNAUTHORIZED('Invalid or expired token');
  }
};

export { generateAuthToken, verifyJWT };
