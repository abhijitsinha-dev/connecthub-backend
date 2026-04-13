import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  createPostService,
  getRandomPostsService,
  getPostsByUsernameService,
  likePostService,
  unlikePostService,
} from './post.service.js';

/**
 * @description Handles the creation of a new post. It attaches the logged-in user's ID to the post data.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const createPost = asyncHandler(async (req, res, _next) => {
  // `req.decodedToken` is provided by the `protect` middleware
  const { id } = /** @type {any} */ (req).decodedToken;
  const { caption, media } = req.body;

  const postData = {
    user: id,
    caption,
    media,
  };

  const post = await createPostService(postData);

  ApiResponse.CREATED({ post }, 'Post created successfully').send(res);
});

/**
 * @description Randomly fetches 10 posts excluding the provided IDs.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getFeedPosts = asyncHandler(async (req, res, _next) => {
  const { excludedPostIds = [] } = req.body;
  const posts = await getRandomPostsService(excludedPostIds);

  ApiResponse.OK({ posts }, 'Posts retrieved successfully').send(res);
});

/**
 * @description Fetches paginated posts created by a specific user.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getPostsByUsername = asyncHandler(async (req, res, _next) => {
  const { username } = req.params;
  const page = parseInt(String(req?.query?.page), 10) || 1;
  const limit = parseInt(String(req?.query?.limit), 10) || 10;

  const { posts, totalPosts } = await getPostsByUsernameService(String(username), page, limit);

  ApiResponse.OK({ posts, totalPosts }, 'User posts retrieved successfully').send(res);
});

/**
 * @description Likes a post
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const likePost = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { postId } = req.params;

  await likePostService(String(postId), userId);

  ApiResponse.OK({}, 'Post liked successfully').send(res);
});

/**
 * @description Unlikes a post
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const unlikePost = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { postId } = req.params;

  await unlikePostService(String(postId), userId);

  ApiResponse.OK({}, 'Post unliked successfully').send(res);
});

export { createPost, getFeedPosts, getPostsByUsername, likePost, unlikePost };
