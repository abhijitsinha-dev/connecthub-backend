import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import validate from '../../middlewares/validate.middleware.js';
import { createCommentSchema } from './comment.validate.js';
import { commentOnPost, getCommentsByPost } from './comment.controller.js';

const router = Router();

router
  .route('/post/:postId')
  .post(protect, validate(createCommentSchema), commentOnPost)
  .get(protect, getCommentsByPost);

export default router;
