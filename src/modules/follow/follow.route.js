import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from './follow.controller.js';

const router = Router();

router.route('/:targetUserId/follow').post(protect, followUser);
router.route('/:targetUserId/unfollow').post(protect, unfollowUser);

router.route('/:userId/followers').get(protect, getFollowers);
router.route('/:userId/following').get(protect, getFollowing);

export default router;
