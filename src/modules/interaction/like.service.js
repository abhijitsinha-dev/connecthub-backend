import mongoose from 'mongoose';
import ApiError from '../../utils/ApiError.js';
import Post from '../post/post.model.js';
import Like from './like.model.js';

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
 * @description Likes a post by creating a Like document and incrementing post likesCount.
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const likePostById = async (postId, userId) => {
  validatePostId(postId);

  const post = await Post.findById(postId).select('_id');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  try {
    await Like.create({
      user: userId,
      onModel: 'Post',
      likedItemId: postId,
    });
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      throw new ApiError(400, 'Post is already liked');
    }

    throw error;
  }

  await Post.findByIdAndUpdate(postId, {
    $inc: { likesCount: 1 },
  });
};

/**
 * @description Unlikes a post by removing Like document and decrementing post likesCount.
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<void>}
 */
const unlikePostById = async (postId, userId) => {
  validatePostId(postId);

  const post = await Post.findById(postId).select('_id');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  const deletedLike = await Like.findOneAndDelete({
    user: userId,
    onModel: 'Post',
    likedItemId: postId,
  });

  if (!deletedLike) {
    throw new ApiError(400, 'Post is not liked');
  }

  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId, likesCount: { $gt: 0 } },
    { $inc: { likesCount: -1 } }
  );

  if (!updatedPost) {
    await Post.findByIdAndUpdate(postId, { $set: { likesCount: 0 } });
  }
};

/**
 * @description Gets likers of a post with pagination.
 * @param {string} postId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{likers: any[], likesCount: number}>}
 */
const getPostLikersByPostId = async (postId, { page = 1, limit = 10 }) => {
  validatePostId(postId);

  const skip = (page - 1) * limit;

  const likes = await Like.find({
    likedItemId: postId,
    onModel: 'Post',
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'avatar username fullName');

  const likesCount = await Like.countDocuments({
    likedItemId: postId,
    onModel: 'Post',
  });

  return {
    likers: likes.map(like => like.user),
    likesCount,
  };
};

export { likePostById, unlikePostById, getPostLikersByPostId };
