import { Router } from 'express';
import {
  forgotPassword,
  forgotPasswordVerifyOTP,
  login,
  logout,
  me,
  resetPassword,
  signup,
  signupVerifyEmail,
} from './auth.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import {
  loginSchema,
  signupSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  forgotPasswordVerifyOTPSchema,
  resetPasswordSchema,
} from './auth.validate.js';

const router = Router();

router.route('/signup').post(validate(signupSchema), signup);
router
  .route('/signup/verify-email')
  .post(validate(verifyEmailSchema), signupVerifyEmail);
router.route('/login').post(validate(loginSchema), login);
router.route('/logout').post(logout);
router.route('/me').get(me);
router
  .route('/forgot-password')
  .post(validate(forgotPasswordSchema), forgotPassword);
router
  .route('/forgot-password/verify-otp')
  .post(validate(forgotPasswordVerifyOTPSchema), forgotPasswordVerifyOTP);
router
  .route('/reset-password')
  .post(validate(resetPasswordSchema), resetPassword);

export default router;
