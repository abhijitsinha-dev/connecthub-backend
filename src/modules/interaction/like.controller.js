import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  getPostLikersByPostId,
  likePostById,
  unlikePostById,
} from './like.service.js';

/**
 * @description Likes a post.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const likePost = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { postId } = req.params;

  await likePostById(String(postId), String(userId));

  ApiResponse.OK({}, 'Post liked successfully').send(res);
});

/**
 * @description Unlikes a post.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const unlikePost = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { postId } = req.params;

  await unlikePostById(String(postId), String(userId));

  ApiResponse.OK({}, 'Post unliked successfully').send(res);
});

/**
 * @description Gets likers of a post.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getPostLikers = asyncHandler(async (req, res, _next) => {
  const { postId } = req.params;
  const page = parseInt(String(req.query.page)) || 1;
  const limit = parseInt(String(req.query.limit)) || 10;

  const data = await getPostLikersByPostId(String(postId), { page, limit });

  ApiResponse.OK(data, 'Post likers fetched successfully').send(res);
});

export { getPostLikers, likePost, unlikePost };
