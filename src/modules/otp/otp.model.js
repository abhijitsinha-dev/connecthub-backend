import mongoose from 'mongoose';
/**
 * @description This file defines the Mongoose schema and model for the OTP (One-Time Password) collection. It includes fields for user association, OTP value, expiration time, verification attempts, and timestamps. The schema also sets up a TTL index to automatically delete expired OTP documents.
 * @typedef {Object} OTPFields
 * @property {import('mongoose').Types.ObjectId} userId
 * @property {string} otp
 * @property {Date} expiresAt
 * @property {number} [attempts]
 * @property {number} [maxAttempts]
 * @property {'signup' | 'password-reset' | 'email-change'} type
 * @property {boolean} isDemo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {OTPFields & import('mongoose').Document<OTPFields>} OTPDocument
 */

/** @type {import('mongoose').Schema<OTPFields>} */
const otpSchema = new mongoose.Schema(
  {
    // The user associated with this OTP. This should be a reference to the User collection.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    // The actual OTP value. In a production system, this should be securely hashed before storage.
    otp: {
      type: String,
      required: [true, 'otp is required'],
    },
    // The expiration time for this OTP. MongoDB will automatically delete the document after this time due to the TTL index defined below.
    expiresAt: {
      type: Date,
      required: [true, 'expiresAt is required'],
    },
    // The number of verification attempts made with this OTP. This can be used to implement a lockout mechanism after a certain number of failed attempts.
    attempts: {
      type: Number,
      default: 0,
    },
    // The maximum number of allowed verification attempts before the OTP is considered invalid. This can help prevent brute-force attacks.
    maxAttempts: {
      type: Number,
      default: 5,
    },
    // The type of OTP, which can be used to differentiate between different use cases (e.g., signup verification, password reset, email change). This allows for more flexible handling of OTPs in the application.
    type: {
      type: String,
      enum: ['signup', 'password-reset', 'email-change'],
      required: true,
    },

    // A flag to indicate if this OTP is part of demo data. This can be useful for filtering out demo OTPs in production environments.
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

// TTL index to automatically delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index to optimize queries for fetching OTPs by user and type
otpSchema.index({ userId: 1, type: 1 }, { unique: true });

/** @type {import('mongoose').Model<OTPFields, {}, {}, {}, OTPDocument>} */
const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
