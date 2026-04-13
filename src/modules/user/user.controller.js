import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  findUserByUsername,
  searchUsersAtlas,
  updateUserById,
  followUserById,
  unfollowUserById,
} from './user.service.js';

/**
 * @description Updates the user's profile information based on the provided user ID and update data. It checks if the user exists, applies the updates, and saves the user document. If the user is not found, it throws a 404 Not Found error.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const updateLoggedInUser = asyncHandler(async (req, res, _next) => {
  const { id } = /** @type {any} */ (req).decodedToken;
  const user = await updateUserById(id, req.body);

  ApiResponse.OK({ user }, 'User updated successfully').send(res);
});

const searchUsers = asyncHandler(async (req, res, _next) => {
  const { q } = req.query;

  const users = await searchUsersAtlas(q);

  ApiResponse.OK({ users }, 'Users retrieved successfully').send(res);
});

/**
 * @description Retrieves a user's profile information based on their username. It checks if the user exists and returns the user data. If the user is not found, it throws a 404 Not Found error.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getUserByUsername = asyncHandler(async (req, res, _next) => {
  const { username } = req.params;

  const user = await findUserByUsername(String(username));

  ApiResponse.OK({ user }, 'User retrieved successfully').send(res);
});

/**
 * @description Follows a target user
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const followUser = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { targetUserId } = req.params;

  await followUserById(userId, String(targetUserId));

  ApiResponse.OK({}, 'User followed successfully').send(res);
});

/**
 * @description Unfollows a target user
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const unfollowUser = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { targetUserId } = req.params;

  await unfollowUserById(userId, String(targetUserId));

  ApiResponse.OK({}, 'User unfollowed successfully').send(res);
});

export {
  updateLoggedInUser,
  searchUsers,
  getUserByUsername,
  followUser,
  unfollowUser,
};
