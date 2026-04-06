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
 * @description Generates a JWT for password reset purposes, containing the user's ID and email. The token is signed with the application's secret key and has a short expiration time of 5 minutes to enhance security.
 * @param {string| import('mongoose').Schema.Types.ObjectId} id - The database ID of the user
 * @param {string} email - The email address of the user
 * @returns {string} The signed JWT for password reset
 */
const generateResetPasswordToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
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
  } catch (err) {
    console.log('JWT verification failed:', err);

    throw ApiError.UNAUTHORIZED('Invalid or expired token');
  }
};

export { generateAuthToken, generateResetPasswordToken, verifyJWT };
