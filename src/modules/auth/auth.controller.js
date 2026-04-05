import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { generateAuthToken, verifyJWT } from '../../utils/token.util.js';
import { sendVerificationEmail } from '../email/email.service.js';
import { signupOTP, generateOTP, verifyEmailOTP } from '../otp/otp.service.js';
import {
  checkLoginCredentials,
  createUser,
  getUserProfile,
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
  await signupOTP(user.id, otp, 'signup');
  await sendVerificationEmail(user.email, otp, user.username);
  ApiResponse.CREATED(
    user,
    'Signed up successfully. Please check your email for the OTP to verify your account.'
  ).send(res);

  return;
});

/**
 * @description Placeholder for email verification logic. In the future, this will handle OTP verification and update the user's emailVerified status accordingly.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const verifyEmail = asyncHandler(async (req, res, _next) => {
  const { id, otp } = req.body;
  await verifyEmailOTP(id, otp, 'signup');
  await verifyUserEmail(id);

  const token = generateAuthToken(id);

  // Attach token to an HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'strict',
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  ApiResponse.OK(null, 'Email verified successfully.').send(res);
  return;
});

const login = asyncHandler(async (req, res, _next) => {
  const { email, password } = req.body;
  const user = await checkLoginCredentials(email, password);
  const token = generateAuthToken(user.id);

  // Attach token to an HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'none',
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  ApiResponse.OK(user, 'Login successful').send(res);
  return;
});

const logout = asyncHandler(async (req, res, _next) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });

  ApiResponse.OK(null, 'Logged out successfully').send(res);
  return;
});

const me = asyncHandler(async (req, res, _next) => {
  const jwt = req?.cookies?.jwt;
  const { id } = verifyJWT(jwt);

  const user = await getUserProfile(id);

  ApiResponse.OK(user, 'User profile retrieved successfully').send(res);
  return;
});

export { signup, verifyEmail, login, logout, me };
