import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import {
  generateAuthToken,
  generateResetPasswordToken,
  verifyJWT,
} from '../../utils/token.util.js';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../email/email.service.js';
import { createOTP, generateOTP, verifyOTP } from '../otp/otp.service.js';
import {
  checkLoginCredentials,
  createUser,
  getUserByEmail,
  getUserById,
  resetUserPassword,
  verifyUserEmail,
} from '../user/user.service.js';

/**
 * @description Handles user registration by creating a new user, generating an OTP for email verification, and sending a verification email.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const signup = asyncHandler(async (req, res, _next) => {
  const user = await createUser(req.body);

  const otp = generateOTP();
  await createOTP(user.id, otp, 'signup');
  await sendVerificationEmail(user.email, otp, user.username);
  ApiResponse.CREATED(
    { user },
    'Signed up successfully. Please check your email for the OTP to verify your account.'
  ).send(res);

  return;
});

/**
 * @description Placeholder for email verification logic. In the future, this will handle OTP verification and update the user's emailVerified status accordingly.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const signupVerifyEmail = asyncHandler(async (req, res, _next) => {
  const { id, otp } = req.body;
  await verifyOTP(id, otp, 'signup');
  await verifyUserEmail(id);

  const token = generateAuthToken(id);

  ApiResponse.OK({ token }, 'Email verified successfully.').send(res);
  return;
});

/**
 * @description Handles user login by validating credentials, generating an authentication token, and returning the user profile along with the token.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const login = asyncHandler(async (req, res, _next) => {
  const { email, password } = req.body;
  const user = await checkLoginCredentials(email, password);
  const token = generateAuthToken(user.id);

  ApiResponse.OK({ user, token }, 'Login successful').send(res);
  return;
});

/**
 * @description Handles user logout by clearing the authentication token cookie and sending a success response.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const logout = asyncHandler(async (req, res, _next) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  ApiResponse.OK(null, 'Logged out successfully').send(res);
  return;
});

/**
 * @description Retrieves the authenticated user's profile information by verifying the JWT token from the request headers and fetching the user data from the database.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const me = asyncHandler(async (req, res, _next) => {
  const authHeader = req?.headers?.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  const { id } = verifyJWT(token);

  const user = await getUserById(id);

  ApiResponse.OK({ user }, 'User profile retrieved successfully').send(res);
  return;
});

/**
 * @description Handles the forgot password process by generating a password reset OTP and sending it to the user's email if the account exists.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const forgotPassword = asyncHandler(async (req, res, _next) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);

  const otp = generateOTP();
  await createOTP(user.id, otp, 'password-reset');
  await sendPasswordResetEmail(user.email, otp, user.username);

  ApiResponse.OK(
    { id: user.id },
    'If an account with that email exists, a password reset link has been sent.'
  ).send(res);
  return;
});

/**
 * @description Verifies the OTP provided by the user during the forgot password process. If the OTP is valid, it generates a password reset token that can be used to reset the password.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const forgotPasswordVerifyOTP = asyncHandler(async (req, res, _next) => {
  const { id, email, otp } = req.body;
  await verifyOTP(id, otp, 'password-reset');
  const resetToken = generateResetPasswordToken(id, email);

  ApiResponse.OK({ resetToken }, 'OTP verified successfully.').send(res);
  return;
});

/**
 * @description Resets the user's password after verifying the provided reset token. It checks the validity of the token, extracts the user ID, and updates the user's password in the database.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const resetPassword = asyncHandler(async (req, res, _next) => {
  const { resetToken, newPassword } = req.body;
  const { id } = verifyJWT(resetToken);
  await resetUserPassword(id, newPassword);

  ApiResponse.OK(null, 'Password reset successfully.').send(res);
  return;
});

export {
  signup,
  signupVerifyEmail,
  login,
  logout,
  me,
  forgotPassword,
  forgotPasswordVerifyOTP,
  resetPassword,
};
