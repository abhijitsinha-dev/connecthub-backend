import mongoose from 'mongoose';

/**
 * @description Mongoose schema and model for the Post collection.
 * @typedef {Object} PostFields
 * @property {mongoose.Schema.Types.ObjectId} id
 * @property {mongoose.Schema.Types.ObjectId} user
 * @property {string} caption
 * @property {Object} media
 * @property {string} media.url
 * @property {string} media.publicId
 * @property {string} media.type
 * @property {Array<mongoose.Schema.Types.ObjectId>} likedBy
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [
        300,
        'caption length must be less than or equal to 300 characters',
      ],
    },
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
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

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
