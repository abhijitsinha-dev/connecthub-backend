import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import { updateLoggedInUser } from './user.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { updateLoggedInUserSchema } from './user.validate.js';

const router = Router();

router
  .route('/profile')
  .patch(validate(updateLoggedInUserSchema), protect, updateLoggedInUser);

export default router;
