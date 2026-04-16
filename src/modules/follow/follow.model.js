import mongoose from 'mongoose';
/**
 * @typedef {Object} FollowFields
 * @property {import('mongoose').Types.ObjectId} follower
 * @property {import('mongoose').Types.ObjectId} following
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {FollowFields & import('mongoose').Document} FollowDocument
 */

/** @type {import('mongoose').Schema<FollowFields>} */
const followSchema = new mongoose.Schema(
  {
    // The person who clicked the "Follow" button
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The person whose profile they were looking at
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// --- CRITICAL INDEXES ---

// 1. Prevent duplicate follows AND quickly check "Is User A following User B?"
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// 2. Quickly fetch the list of people following a specific user (sorted by newest)
followSchema.index({ following: 1, createdAt: -1 });

// 3. Quickly fetch the list of people a specific user is following
// (No need for unique: true here, just a standard index)
followSchema.index({ follower: 1, createdAt: -1 });

/**@type {import('mongoose').Model<FollowDocument>}*/
const Follow = mongoose.model('Follow', followSchema);
export default Follow;
