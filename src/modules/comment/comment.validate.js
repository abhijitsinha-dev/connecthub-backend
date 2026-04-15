import { customJoi } from '../../config/joi.js';

const createCommentSchema = customJoi.object({
  content: customJoi.string().trim().required().max(200).messages({
    'string.empty': 'Comment content cannot be empty',
    'string.max':
      'Comment content must be less than or equal to 200 characters',
    'any.required': 'Comment content is required',
  }),
});

export { createCommentSchema };
