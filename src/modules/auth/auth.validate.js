import validator from 'validator';
import { customJoi } from '../../config/joi.js';

/**
 * @description Validation schemas for authentication-related routes, including signup, email verification, login, forgot password, and reset password. These schemas ensure that incoming request data adheres to the expected format and constraints before being processed by the controllers.
 */
const signupSchema = customJoi.object({
  username: customJoi
    .string()
    .trim()
    .min(5)
    .max(50)
    .regex(/^[a-z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base':
        'username must contain only lowercase letters, numbers, underscores, and hyphens',
    }),

  email: customJoi.string().email().trim().max(255).required().lowercase(),

  password: customJoi
    .string()
    .required()
    .trim()
    .min(8)
    .max(128)
    .custom((value, helpers) => {
      if (!validator.isStrongPassword(value)) {
        return helpers.error('strongPassword');
      }

      return value;
    })
    .messages({
      strongPassword:
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols',
    }),

  confirmPassword: customJoi
    .required()
    .valid(customJoi.ref('password'))
    .messages({ 'any.only': 'Passwords do not match' }),
});

/**
 * @description Validation schema for email verification during signup. It checks that the provided user ID is a valid MongoDB ObjectId and that the OTP is a 6-digit string.
 * @type {import('joi').ObjectSchema}
 */
const verifyEmailSchema = customJoi.object({
  id: customJoi
    .custom((value, helpers) => {
      if (!validator.isMongoId(value)) {
        return helpers.error('mongoId');
      }
      return value;
    })
    .required()
    .messages({
      mongoId: 'Invalid userId',
    }),

  otp: customJoi.string().length(6).required(),
});

const loginSchema = customJoi.object({
  email: customJoi
    .string()
    .email()
    .trim()
    .max(255)
    .required()
    .lowercase()
    .messages({
      'string.email': 'Incorrect email or password',
      'string.max': 'Incorrect email or password',
    }),

  password: customJoi
    .string()
    .required()
    .trim()
    .max(128)
    .custom((value, helpers) => {
      if (!validator.isStrongPassword(value)) {
        return helpers.error('incorrect');
      }

      return value;
    })
    .messages({
      incorrect: 'Incorrect email or password',
      'string.max': 'Incorrect email or password',
    }),
});

/**
 * @description Validation schema for the forgot password endpoint. It checks that the provided email is in a valid format and does not exceed 255 characters. The error messages are intentionally vague to prevent user enumeration.
 * @type {import('joi').ObjectSchema}
 */
const forgotPasswordSchema = customJoi.object({
  email: customJoi
    .string()
    .email()
    .trim()
    .max(255)
    .required()
    .lowercase()
    .messages({
      'string.email':
        'If an account with that email exists, a password reset OTP has been sent',
      'string.max':
        'If an account with that email exists, a password reset OTP has been sent',
    }),
});

/**
 * @description Validation schema for verifying the OTP during the forgot password process. It checks that the provided user ID is a valid MongoDB ObjectId, the email is in a valid format, and the OTP is a 6-digit string. The error messages are intentionally vague to prevent user enumeration.
 * @type {import('joi').ObjectSchema}
 */
const forgotPasswordVerifyOTPSchema = customJoi.object({
  id: customJoi
    .custom((value, helpers) => {
      if (!validator.isMongoId(value)) {
        return helpers.error('mongoId');
      }
      return value;
    })
    .required()
    .messages({
      mongoId: 'Invalid userId',
    }),

  email: customJoi
    .string()
    .email()
    .trim()
    .max(255)
    .required()
    .lowercase()
    .messages({
      'string.email': 'Invalid email or OTP',
      'string.max': 'Invalid email or OTP',
    }),

  otp: customJoi.string().length(6).required().messages({
    'string.length': 'Invalid email or OTP',
  }),
});

const resetPasswordSchema = customJoi.object({
  resetToken: customJoi
    .string()
    .required()
    .custom((value, helpers) => {
      if (!validator.isJWT(value)) {
        return helpers.error('invalidToken');
      }

      return value;
    })
    .messages({
      invalidToken: 'Invalid or expired reset token',
    }),

  newPassword: customJoi
    .string()
    .required()
    .trim()
    .min(8)
    .max(128)
    .custom((value, helpers) => {
      if (!validator.isStrongPassword(value)) {
        return helpers.error('strongPassword');
      }

      return value;
    })
    .messages({
      strongPassword:
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols',
      'string.max':
        'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols',
    }),

  confirmNewPassword: customJoi
    .required()
    .valid(customJoi.ref('newPassword'))
    .messages({ 'any.only': 'Passwords do not match' }),
});

export {
  signupSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  forgotPasswordVerifyOTPSchema,
  resetPasswordSchema,
};
