import mongoose from 'mongoose';
import ApiError from '../../utils/ApiError.js';
import Post from '../post/post.model.js';
import Comment from './comment.model.js';

/**
 * @param {string} postId
 */
const validatePostId = postId => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, 'postId must be a valid ObjectId', [
      {
        field: 'postId',
        constraint: 'invalid',
        message: 'postId must be a valid ObjectId',
      },
    ]);
  }
};

/**
 * @description Creates a comment on a post and increments post commentsCount.
 * @param {string} postId
 * @param {string} userId
 * @param {string} content
 * @returns {Promise<Object>}
 */
const createCommentService = async (postId, userId, content) => {
  validatePostId(postId);

  const post = await Post.findById(postId).select('_id');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  const comment = await Comment.create({
    user: userId,
    content,
    onModel: 'Post',
    commentedItemId: postId,
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: { commentsCount: 1 },
  });

  return comment.toJSON();
};

/**
 * @description Retrieves paginated comments for a post.
 * @param {string} postId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{comments: Object[], commentsCount: number}>}
 */
const getCommentsByPostService = async (postId, page = 1, limit = 10) => {
  validatePostId(postId);

  const post = await Post.findById(postId).select('_id commentsCount');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  const skip = (page - 1) * limit;

  const comments = await Comment.find({
    onModel: 'Post',
    commentedItemId: postId,
  })
    .populate({
      path: 'user',
      select: 'avatar username fullName',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    comments: comments.map(comment => comment.toJSON()),
    commentsCount: post.commentsCount,
  };
};

export { createCommentService, getCommentsByPostService };
