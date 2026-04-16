import mongoose from 'mongoose';

/**
 * @description Mongoose schema and model for the Post collection.
 * @typedef {Object} PostFields
 * @property {import('mongoose').Types.ObjectId} id
 * @property {import('mongoose').Types.ObjectId} user
 * @property {string} caption
 * @property {Object} media
 * @property {string} media.url
 * @property {string} media.publicId
 * @property {string} media.type
 * @property {number} likesCount
 * @property {number} commentsCount
 * @property {boolean} isDemo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {PostFields & import('mongoose').Document} PostDocument
 */

/** @type {import('mongoose').Schema<PostFields>} */
const postSchema = new mongoose.Schema(
  {
    // The user who created the post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    // The text caption of the post
    caption: {
      type: String,
      trim: true,
      maxlength: [
        300,
        'caption length must be less than or equal to 300 characters',
      ],
    },
    // Optional media associated with the post (image or video)
    media: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      type: {
        type: String,
        enum: ['image', 'video'],
      },
    },
    // A count of how many likes this post has received. This is denormalized for performance.
    likesCount: {
      type: Number,
      default: 0,
    },
    // A count of how many comments this post has received. This is denormalized for performance.
    commentsCount: {
      type: Number,
      default: 0,
    },

    // A flag to indicate if this post is part of demo data. This can be useful for filtering out demo posts in production.
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

// Index to optimize fetching a user's posts in reverse chronological order (for profile feeds)
postSchema.index({ user: 1, createdAt: -1 });
// Index to optimize fetching recent posts for the main feed
postSchema.index({ createdAt: -1 });

// Pre-validate hook to make sure a post has either a caption or media
postSchema.pre('validate', function () {
  const hasCaption = this.caption && this.caption.trim().length > 0;
  const hasMediaUrl =
    this.media && this.media.url && this.media.url.trim().length > 0;

  if (!hasCaption && !hasMediaUrl) {
    this.invalidate('caption', 'Post must contain either a caption or media');
  }
});

/** @type {import('mongoose').Model<PostDocument>} */
const Post = mongoose.model('Post', postSchema);

export default Post;
