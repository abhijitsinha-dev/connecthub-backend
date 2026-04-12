import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import validate from '../../middlewares/validate.middleware.js';
import { createPostSchema, getFeedPostsSchema } from './post.validate.js';
import { createPost, getFeedPosts } from './post.controller.js';

const router = Router();

// Route to create a post, protected by authentication and validated against schema
router.route('/').post(protect, validate(createPostSchema), createPost);

// Route to get a randomized feed of posts, with potential exclusion logic
router.route('/feed').post(protect, validate(getFeedPostsSchema), getFeedPosts);

export default router;
