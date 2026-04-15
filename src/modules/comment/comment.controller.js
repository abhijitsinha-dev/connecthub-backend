import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  createCommentService,
  getCommentsByPostService,
} from './comment.service.js';

/**
 * @description Creates a comment on a post.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const commentOnPost = asyncHandler(async (req, res, _next) => {
  const { id: userId } = /** @type {any} */ (req).decodedToken;
  const { postId } = req.params;
  const { content } = req.body;

  const comment = await createCommentService(String(postId), userId, content);

  ApiResponse.CREATED({ comment }, 'Comment created successfully').send(res);
});

/**
 * @description Retrieves paginated comments for a post.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getCommentsByPost = asyncHandler(async (req, res, _next) => {
  const { postId } = req.params;
  const page = parseInt(String(req?.query?.page), 10) || 1;
  const limit = parseInt(String(req?.query?.limit), 10) || 10;

  const { comments, commentsCount } = await getCommentsByPostService(
    String(postId),
    page,
    limit
  );

  ApiResponse.OK(
    { comments, commentsCount },
    'Comments retrieved successfully'
  ).send(res);
});

export { commentOnPost, getCommentsByPost };
