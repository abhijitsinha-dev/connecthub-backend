import { Router } from 'express';
import {
  changePassword,
  emailChangeRequest,
  emailChangeVerifyOTP,
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
  emailChangeRequestSchema,
  emailChangeVerifyOTPSchema,
  changePasswordSchema,
} from './auth.validate.js';
import protect from '../../middlewares/protect.js';

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

router
  .route('/email')
  .patch(protect, validate(emailChangeRequestSchema), emailChangeRequest);

router
  .route('/email/verify-otp')
  .patch(protect, validate(emailChangeVerifyOTPSchema), emailChangeVerifyOTP);

router
  .route('/password')
  .patch(protect, validate(changePasswordSchema), changePassword);

export default router;
