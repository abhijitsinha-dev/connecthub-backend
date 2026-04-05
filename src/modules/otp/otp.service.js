import crypto from 'crypto';
import OTP from './otp.model.js';
import ApiError from '../../utils/ApiError.js';

const generateOTP = (length = 6) => {
  // Ensure length is valid
  if (length < 1) throw new Error('OTP length must be at least 1');

  // Calculate min and max values
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Generate cryptographically secure random number
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * @description Generates a new OTP for the specified user and type, ensuring that any existing OTPs of the same type for that user are deleted first. This is used for actions like signup verification, password reset, or email change verification.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @param {string} otp
 * @param {'signup' | 'password-reset' | 'email-change'} type
 */
const signupOTP = async (userId, otp, type) => {
  await OTP.deleteMany({ userId });
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
  await OTP.create({ userId, otp, type, expiresAt });
};

/**
 * @description Verifies the provided OTP for the specified user and type. It checks if the OTP exists, is valid, and has not expired. If the OTP is valid, it deletes the OTP document to prevent reuse. If the OTP is invalid or expired, it throws an error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @param {string} otp
 * @param {'signup' | 'password-reset' | 'email-change'} type
 * @throws {import('../utils/ApiError.js').ApiError} Throws an error if the OTP is invalid or has expired.
 */
const verifyEmailOTP = async (userId, otp, type) => {
  const otpDoc = await OTP.findOne({ userId, otp, type });
  if (!otpDoc) {
    throw new ApiError(400, 'Invalid OTP', [
      {
        field: 'otp',
        constraint: 'invalid',
        message: 'Invalid OTP',
      },
    ]);
  }
  if (otpDoc.expiresAt < new Date()) {
    await OTP.deleteMany({ userId });
    throw new ApiError(400, 'OTP has expired', [
      {
        field: 'otp',
        constraint: 'expired',
        message: 'OTP has expired',
      },
    ]);
  }
  await OTP.deleteMany({ userId });
};

export { generateOTP, signupOTP, verifyEmailOTP };
