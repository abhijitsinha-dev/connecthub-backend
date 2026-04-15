import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import { likePost, unlikePost } from './like.controller.js';

const router = Router();

router.route('/post/like/:postId').post(protect, likePost);
router.route('/post/unlike/:postId').post(protect, unlikePost);

export default router;
