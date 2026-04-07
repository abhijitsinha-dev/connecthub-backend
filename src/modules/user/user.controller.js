import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { updateUserById } from './user.service.js';

/**
 * @description Updates the user's profile information based on the provided user ID and update data. It checks if the user exists, applies the updates, and saves the user document. If the user is not found, it throws a 404 Not Found error.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const updateLoggedInUser = asyncHandler(async (req, res, _next) => {
  const { id } = req.decodedToken;
  const user = await updateUserById(id, req.body);

  ApiResponse.OK({ user }, 'User updated successfully').send(res);
});

export { updateLoggedInUser };
