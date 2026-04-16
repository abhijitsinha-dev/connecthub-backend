import mongoose from 'mongoose';

/**
 * @description Comment model to represent comments on posts.
 * @typedef {Object} CommentFields
 * @property {import('mongoose').Types.ObjectId} user
 * @property {string} content
 * @property {string} onModel
 * @property {import('mongoose').Types.ObjectId} commentedItemId
 * @property {number} likesCount
 * @property {boolean} [isDemo=false]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/** @typedef {CommentFields & import('mongoose').Document} CommentDocument */

/** @type {import('mongoose').Schema<CommentFields>} */
const commentSchema = new mongoose.Schema(
  {
    // The user who made the comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    // The actual text content of the comment
    content: {
      type: String,
      required: [true, 'content is required'],
      trim: true,
      maxlength: [
        200,
        'content length must be less than or equal to 200 characters',
      ],
    },
    // The dynamic reference field to determine if this comment is on a Post or another Comment (for nested comments)
    onModel: {
      type: String,
      required: [true, 'onModel is required'],
      enum: ['Post', 'Comment'], // Add any future likeable models here
    },
    // The actual ID of the post or comment being commented on
    commentedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'commentedItemId is required'],
      refPath: 'onModel', // Tells Mongoose to look at 'onModel' to know which collection to join!
    },
    likesCount: {
      type: Number,
      default: 0,
    },

    // A flag to indicate if this comment is part of demo data. This can be useful for filtering out demo comments in production.
    isDemo: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
    strictQuery: false,

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

// Indexes to optimize queries for fetching comments by post/comment and for fetching a user's comments
commentSchema.index({ commentedItemId: 1, onModel: 1 });
// Additional index to optimize queries that fetch comments by a specific user
commentSchema.index({ commentedItemId: 1, onModel: 1, createdAt: -1 });
// Index to optimize queries that fetch comments by a specific user
commentSchema.index({ user: 1 });

/** @type {import('mongoose').Model<CommentDocument>} */
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
