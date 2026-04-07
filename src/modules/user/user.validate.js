import validator from 'validator';
import { customJoi } from '../../config/joi.js';

const updateLoggedInUserSchema = customJoi
  .object({
    username: customJoi
      .string()
      .trim()
      .min(5)
      .max(50)
      .regex(/^[a-z0-9_-]+$/)
      .messages({
        'string.pattern.base':
          'username must contain only lowercase letters, numbers, underscores, and hyphens',
      }),

    fullName: customJoi
      .string()
      .trim()
      .min(5)
      .max(100)
      .custom((value, helpers) => {
        if (!validator.isAlpha(value)) {
          return helpers.error('invalidFullName');
        }
        return value;
      })
      .messages({
        'string.min': 'Full name must be at least 5 characters',
        'string.max': 'Full name must be at most 100 characters',
        invalidFullName: 'Full name must contain only letters',
      }),

    phoneNumber: customJoi
      .string()
      .trim()
      .custom((value, helpers) => {
        if (!validator.isMobilePhone(value)) {
          return helpers.error('invalidPhoneNumber');
        }
        return value;
      })
      .messages({
        invalidPhoneNumber: 'Invalid phone number',
      })
      .allow(''),

    avatar: customJoi
      .object({
        url: customJoi.string().uri().messages({
          'string.uri': 'Avatar URL must be a valid URL',
        }),
        publicId: customJoi.string(),
      })
      .allow(null),

    coverImage: customJoi
      .object({
        url: customJoi.string().uri().messages({
          'string.uri': 'Cover image URL must be a valid URL',
        }),
        publicId: customJoi.string(),
      })
      .allow(null),

    gender: customJoi
      .string()
      .valid('male', 'female', 'other', 'prefer not to say')
      .messages({
        'any.only':
          'Gender must be one of the following: male, female, other, prefer not to say',
      }),

    bio: customJoi.string().trim().max(200).allow(''),

    dateOfBirth: customJoi
      .date()
      .less('now')
      .messages({
        'date.less': 'Date of birth must be in the past',
      })
      .allow(null),

    address: customJoi.string().trim().max(200).allow(''),
  })
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export { updateLoggedInUserSchema };
