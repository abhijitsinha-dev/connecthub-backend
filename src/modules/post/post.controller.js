import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { createPostService, getRandomPostsService } from './post.service.js';

/**
 * @description Handles the creation of a new post. It attaches the logged-in user's ID to the post data.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const createPost = asyncHandler(async (req, res, _next) => {
  // `req.decodedToken` is provided by the `protect` middleware
  const { id } = req.decodedToken;
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

export { createPost, getFeedPosts };
