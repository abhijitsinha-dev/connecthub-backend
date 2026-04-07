import validator from 'validator';
import { customJoi } from '../../config/joi.js';

const updateLoggedInUserSchema = customJoi
  .object({
    username: customJoi.string().trim().min(3).max(30).messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
    }),

    fullName: customJoi.string().trim().min(3).max(100).messages({
      'string.min': 'Full name must be at least 3 characters',
      'string.max': 'Full name must be at most 100 characters',
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
      .allow(null),

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
  })
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

export { updateLoggedInUserSchema };
