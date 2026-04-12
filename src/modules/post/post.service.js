import mongoose from 'mongoose';
import Post from './post.model.js';

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

export { createPostService, getRandomPostsService };
