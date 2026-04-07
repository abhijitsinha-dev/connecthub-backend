import asyncHandler from '../utils/asyncHandler.js';
import { verifyJWT } from '../utils/token.util.js';

/**
 * Middleware to protect routes by verifying the presence and validity of a JWT token in the Authorization header. If the token is valid, the decoded token information is attached to the request object for use in subsequent middleware or route handlers.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const protect = asyncHandler(async (req, _res, next) => {
  // Extract token from the Authorization header
  const authHeader = req?.headers?.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  const decodedToken = verifyJWT(token);

  req.decodedToken = decodedToken;
  next();
});

export default protect;
