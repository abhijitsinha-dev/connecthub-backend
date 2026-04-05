import mongoose from 'mongoose';
/**
 * @description This file defines the Mongoose schema and model for the OTP (One-Time Password) collection. It includes fields for user association, OTP value, expiration time, verification attempts, and timestamps. The schema also sets up a TTL index to automatically delete expired OTP documents.
 * @typedef {Object} OTPFields
 * @property {mongoose.Schema.Types.ObjectId} userId
 * @property {string} otp
 * @property {Date} expiresAt
 * @property {number} [attempts]
 * @property {number} [maxAttempts]
 * @property {'signup' | 'password-reset' | 'email-change'} type
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {OTPFields & import('mongoose').Document<OTPFields>} OTPDocument
 */

/** @type {import('mongoose').Schema<OTPFields>} */
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
    },

    type: {
      type: String,
      enum: ['signup', 'password-reset', 'email-change'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired OTP documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/** @type {import('mongoose').Model<OTPFields, {}, {}, {}, OTPDocument>} */
const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
