import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import validate from '../../middlewares/validate.middleware.js';
import { createPostSchema } from './post.validate.js';
import { createPost } from './post.controller.js';

const router = Router();

// Route to create a post, protected by authentication and validated against schema
router.route('/').post(protect, validate(createPostSchema), createPost);

export default router;
