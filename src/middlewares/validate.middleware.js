import asyncHandler from '../utils/asyncHandler.js';

/**
 * Middleware to validate request body against a schema
 * @param {import('joi').Schema} schema
 * @returns {import('express').RequestHandler}
 */
const validate = schema =>
  asyncHandler(async (req, _res, next) => {
    const value = await schema.validateAsync(req.body);

    req.body = value;
    next();
  });

export default validate;
