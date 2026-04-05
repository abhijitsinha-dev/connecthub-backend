import validator from 'validator';
import { customJoi } from '../../config/joi.js';

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

export { signupSchema, verifyEmailSchema, loginSchema };
