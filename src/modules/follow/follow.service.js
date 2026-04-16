import mongoose from 'mongoose';
import Follow from './follow.model.js';
import User from '../user/user.model.js';
import ApiError from '../../utils/ApiError.js';

/**
 * @description Validates if the provided string is a valid MongoDB ObjectId
 * @param {string} id - The ID string to validate
 * @param {string} fieldName - Field name for clear error messaging
 * @throws {ApiError} - 400 Bad Request
 */
const validateUserId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${fieldName} must be a valid ObjectId`, [
      {
        field: fieldName,
        constraint: 'invalid',
        message: `${fieldName} must be a valid ObjectId`,
      },
    ]);
  }
};

/**
 * @description Follows a target user.
 * @param {string} followerId
 * @param {string} targetUserId
 */
const followUserById = async (followerId, targetUserId) => {
  validateUserId(followerId, 'followerId');
  validateUserId(targetUserId, 'targetUserId');

  if (followerId.toString() === targetUserId.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const targetUser = await User.findById(targetUserId).select('_id');
  if (!targetUser) {
    throw ApiError.NOT_FOUND('User to follow');
  }

  try {
    await Follow.create({ follower: followerId, following: targetUserId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, 'You are already following this user');
    }
    throw error;
  }

  await Promise.all([
    User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
    User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
  ]);
};

/**
 * @description Unfollows a target user.
 * @param {string} followerId
 * @param {string} targetUserId
 */
const unfollowUserById = async (followerId, targetUserId) => {
  validateUserId(followerId, 'followerId');
  validateUserId(targetUserId, 'targetUserId');

  const deletedFollow = await Follow.findOneAndDelete({
    follower: followerId,
    following: targetUserId,
  });

  if (!deletedFollow) {
    throw new ApiError(400, 'You are not following this user');
  }

  await Promise.all([
    User.findOneAndUpdate(
      { _id: followerId, followingCount: { $gt: 0 } },
      { $inc: { followingCount: -1 } }
    ),
    User.findOneAndUpdate(
      { _id: targetUserId, followersCount: { $gt: 0 } },
      { $inc: { followersCount: -1 } }
    ),
  ]);
};

/**
 * @description Gets followers of a user with pagination.
 * @param {string} userId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{followers: any[], followersCount: number}>}
 */
const getFollowersByUserId = async (userId, { page = 1, limit = 10 }) => {
  validateUserId(userId, 'userId');

  const skip = (page - 1) * limit;

  const follows = await Follow.find({ following: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('follower', 'avatar username fullName');

  const followersCount = await Follow.countDocuments({ following: userId });

  return {
    followers: follows.map(f => f.follower),
    followersCount,
  };
};

/**
 * @description Gets users followed by a user with pagination.
 * @param {string} userId
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{following: any[], followingCount: number}>}
 */
const getFollowingByUserId = async (userId, { page = 1, limit = 10 }) => {
  validateUserId(userId, 'userId');

  const skip = (page - 1) * limit;

  const follows = await Follow.find({ follower: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('following', 'avatar username fullName');

  const followingCount = await Follow.countDocuments({ follower: userId });

  return {
    following: follows.map(f => f.following),
    followingCount,
  };
};

export { followUserById, unfollowUserById, getFollowersByUserId, getFollowingByUserId };
