import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import {
  getPostLikers,
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
} from './like.controller.js';

const router = Router();

router.route('/post/like/:postId').post(protect, likePost);
router.route('/post/unlike/:postId').post(protect, unlikePost);
router.route('/post/likers/:postId').get(protect, getPostLikers);

router.route('/comment/like/:commentId').post(protect, likeComment);
router.route('/comment/unlike/:commentId').post(protect, unlikeComment);

export default router;
