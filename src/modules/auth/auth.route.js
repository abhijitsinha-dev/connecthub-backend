import { Router } from 'express';
import { login, logout, me, signup, verifyEmail } from './auth.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
} from './auth.validate.js';

const router = Router();

router.route('/signup').post(validate(signupSchema), signup);
router.route('/verify-email').post(validate(verifyEmailSchema), verifyEmail);
router.route('/login').post(validate(loginSchema), login);
router.route('/logout').post(logout);
router.route('/me').get(me);

export default router;
