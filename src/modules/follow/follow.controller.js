import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  followUserById,
  unfollowUserById,
  getFollowersByUserId,
  getFollowingByUserId,
} from './follow.service.js';

/**
 * @description Follows a target user.
 * @type {import('express').RequestHandler}
 */
const followUser = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { targetUserId } = req.params;

  await followUserById(userId, String(targetUserId));

  ApiResponse.OK({}, 'User followed successfully').send(res);
});

/**
 * @description Unfollows a target user.
 * @type {import('express').RequestHandler}
 */
const unfollowUser = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { targetUserId } = req.params;

  await unfollowUserById(userId, String(targetUserId));

  ApiResponse.OK({}, 'User unfollowed successfully').send(res);
});

/**
 * @description Gets followers of a user.
 * @type {import('express').RequestHandler}
 */
const getFollowers = asyncHandler(async (req, res, _next) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const data = await getFollowersByUserId(String(userId), {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  ApiResponse.OK(data, 'Followers retrieved successfully').send(res);
});

/**
 * @description Gets users followed by a user.
 * @type {import('express').RequestHandler}
 */
const getFollowing = asyncHandler(async (req, res, _next) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const data = await getFollowingByUserId(String(userId), {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  ApiResponse.OK(data, 'Following retrieved successfully').send(res);
});

export { followUser, unfollowUser, getFollowers, getFollowing };
