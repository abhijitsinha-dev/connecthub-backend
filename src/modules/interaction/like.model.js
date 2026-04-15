import mongoose from 'mongoose';

/**
 * @description Like model to represent likes on posts and comments.
 * @typedef {Object} LikeFields
 * @property {import('mongoose').Types.ObjectId} user
 * @property {string} onModel
 * @property {import('mongoose').Types.ObjectId} likedItemId
 * @property {boolean} [isDemo=false]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/** @typedef {LikeFields & import('mongoose').Document} LikeDocument */

/** @type {import('mongoose').Schema<LikeFields>} */
const likeSchema = new mongoose.Schema(
  {
    // The user who made the like
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    // The dynamic reference field to determine if this like is on a Post or a Comment (for future extensibility)
    onModel: {
      type: String,
      required: [true, 'onModel is required'],
      enum: ['Post', 'Comment'],
    },
    // The actual ID of the post or comment being liked
    likedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'likedItemId is required'],
      refPath: 'onModel',
    },

    // A flag to indicate if this like is part of demo data. This can be useful for filtering out demo likes in production.
    isDemo: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: function (_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

// CRITICAL INDEXING: A user can only like a specific post/comment ONCE
likeSchema.index({ user: 1, likedItemId: 1, onModel: 1 }, { unique: true });
// Index to optimize queries for fetching likes by post/comment and for fetching a user's likes
likeSchema.index({ likedItemId: 1, onModel: 1, createdAt: -1 });

/** @type {import('mongoose').Model<LikeDocument>} */
const Like = mongoose.model('Like', likeSchema);
export default Like;
