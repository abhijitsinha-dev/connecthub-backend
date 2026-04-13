import mongoose from 'mongoose';
import Post from './post.model.js';
import User from '../user/user.model.js';
import ApiError from '../../utils/ApiError.js';

/**
 * @description Creates a new post with the provided data.
 * @param {Object} postData
 * @returns {Promise<Object>}
 */
const createPostService = async postData => {
  const newPost = await Post.create(postData);
  return newPost.toJSON();
};

/**
 * @description Retrieves a random feed of 10 posts while ignoring the provided excluded post IDs.
 * @param {string[]} excludedPostIds Array of MongoDB ObjectIds as strings
 * @returns {Promise<Object[]>}
 */
const getRandomPostsService = async (excludedPostIds = []) => {
  const limit = 10;

  // 1. Convert excluded IDs safely
  const excludedObjectIds =
    excludedPostIds && excludedPostIds.length > 0
      ? excludedPostIds.map(id => new mongoose.Types.ObjectId(id))
      : [];

  // 2. Calculate over-sample size
  // We grab extra docs to ensure we still have 10 left even if we randomly pick excluded ones
  const sampleSize = limit + excludedObjectIds.length;

  const pipeline = [
    // --- STAGE 1: THE MAGIC FIX ---
    // $sample MUST be first to trigger the instant random cursor
    { $sample: { size: sampleSize } },

    // --- STAGE 2: FILTER ---
    // Filter the excluded IDs out of this tiny 10-20 document pool
    ...(excludedObjectIds.length > 0
      ? [
          {
            $match: {
              _id: { $nin: excludedObjectIds },
            },
          },
        ]
      : []),

    // --- STAGE 3: TRIM ---
    // Ensure we send exactly 10 back, dropping any extras we over-sampled
    { $limit: limit },

    // --- STAGE 4: LOOKUP & FORMATTING ---
    {
      $lookup: {
        from: 'users', // Make sure your DB collection is actually named 'users'
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          { $project: { _id: 1, username: 1, fullName: 1, avatar: 1 } },
        ],
      },
    },
    { $unwind: '$user' },
    {
      $addFields: {
        id: '$_id',
        'user.id': '$user._id',
      },
    },
    {
      $project: {
        _id: 0,
        'user._id': 0,
        __v: 0,
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);
  return posts;
};

/**
 * @description Retrieves posts created by a specific user, sorted from newest to oldest.
 * @param {string} username Username of the target user
 * @param {number} page Page number for pagination
 * @param {number} limit Number of items per page
 * @returns {Promise<{posts: Object[], totalPosts: number}>}
 */
const getPostsByUsernameService = async (username, page = 1, limit = 10) => {
  // 1. Fetch ONLY the user's _id. We don't need anything else.
  const user = await User.findOne({ username }).select('_id');

  if (!user) {
    throw ApiError.NOT_FOUND('username');
  }

  const skip = (page - 1) * limit;

  // 2. Fetch the posts and the total count in parallel
  const [posts, totalPosts] = await Promise.all([
    Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments({ user: user._id }),
  ]);

  // 3. Format using the schema rules you already wrote
  const formattedPosts = posts.map(post => post.toJSON());

  return { posts: formattedPosts, totalPosts };
};

/**
 * @description Adds a like to a post for a specific user.
 * @param {string | mongoose.Schema.Types.ObjectId} postId 
 * @param {string | mongoose.Schema.Types.ObjectId} userId 
 * @returns {Promise<void>}
 */
const likePostService = async (postId, userId) => {
  const post = await Post.findById(postId).select('_id likedBy');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  const isLiked = post.likedBy.some(id => id.toString() === userId.toString());
  if (isLiked) {
    throw new ApiError(400, 'Post is already liked');
  }

  await Post.findByIdAndUpdate(postId, { $addToSet: { likedBy: userId } });
};

/**
 * @description Removes a like from a post for a specific user.
 * @param {string | mongoose.Schema.Types.ObjectId} postId 
 * @param {string | mongoose.Schema.Types.ObjectId} userId 
 * @returns {Promise<void>}
 */
const unlikePostService = async (postId, userId) => {
  const post = await Post.findById(postId).select('_id likedBy');
  if (!post) {
    throw ApiError.NOT_FOUND('postId');
  }

  const isLiked = post.likedBy.some(id => id.toString() === userId.toString());
  if (!isLiked) {
    throw new ApiError(400, 'Post is not liked');
  }

  await Post.findByIdAndUpdate(postId, { $pull: { likedBy: userId } });
};

export {
  createPostService,
  getRandomPostsService,
  getPostsByUsernameService,
  likePostService,
  unlikePostService,
};
