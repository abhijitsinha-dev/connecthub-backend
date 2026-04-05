/**
 * Wraps an async function to catch errors and pass them to the next middleware.
 * @param {import('express').RequestHandler} requestHandler
 * @returns {import('express').RequestHandler}
 */
const asyncHandler = requestHandler => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));
};

export default asyncHandler;
