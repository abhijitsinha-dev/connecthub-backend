import { customJoi } from '../../config/joi.js';

const createPostSchema = customJoi
  .object({
    caption: customJoi.string().trim().max(300).allow(''),
    media: customJoi
      .object({
        url: customJoi.string().uri().required().messages({
          'string.uri': 'Media URL must be a valid URL',
          'any.required': 'Media URL is required if media is provided',
        }),
        publicId: customJoi.string().required().messages({
          'any.required': 'Media publicId is required if media is provided',
        }),
        type: customJoi.string().valid('image', 'video').required().messages({
          'any.only': 'Media type must be either image or video',
          'any.required': 'Media type is required if media is provided',
        }),
      })
      .allow(null),
  })
  .custom((value, helpers) => {
    const hasCaption = value.caption && value.caption.trim().length > 0;
    const hasMedia =
      value.media && value.media.url && value.media.url.trim().length > 0;

    if (!hasCaption && !hasMedia) {
      return helpers.error('Post must contain either a caption or media');
    }
    return value;
  })
  .messages({
    'object.base': 'Request body must be an object',
  });

export { createPostSchema };
