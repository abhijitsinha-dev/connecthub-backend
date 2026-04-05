import ApiError from '../../utils/ApiError.js';
import User from './user.model.js';

/**
 * @description Input data structure for creating a new user account, including username, email, and password. This is used for type annotations and documentation purposes.
 * @typedef {Object} CreateUserInput
 * @property {string} username - The unique username for the account
 * @property {string} email - The user's email address
 * @property {string} password - The plain-text password (to be hashed by model hooks)
 */

/**
 * @description Creates a new user account with the provided data. It checks for existing users with the same email or username, handles conflicts based on verification status, and implements a reclaim logic for unverified accounts. If a conflict is detected, it throws an ApiError with a 409 status code.
 * @param {CreateUserInput} userData
 * @returns {Promise<import('./user.model.js').UserFields>}
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const createUser = async userData => {
  const { username, email, password } = userData;

  const users = await User.find({ $or: [{ email }, { username }] });

  if (users.length === 0) {
    return (await User.create({ username, email, password })).toJSON();
  }

  const userByEmail = users.find(u => u.email === email);
  const userByUsername = users.find(u => u.username === username);

  // 1. If either is verified, it's a hard conflict (different people)
  if (userByEmail?.emailVerified) throw ApiError.CONFLICT('email');
  if (userByUsername?.emailVerified) throw ApiError.CONFLICT('username');

  // 2. If both exist but are unverified, it's a conflict (same person, different credentials)
  // Because of the TTL index, we KNOW this is < 24 hours old
  if (userByUsername && userByUsername.email !== email) {
    throw ApiError.CONFLICT('username');
  }

  // 3. Reclaim Logic (Same person/email)
  const targetUser = userByEmail || userByUsername;
  if (!targetUser?.emailVerified) {
    targetUser.username = username;
    targetUser.password = password;
    targetUser.createdAt = new Date(); // This resets the 24h timer!
    return (await targetUser.save()).toJSON();
  }

  return (await User.create({ username, email, password })).toJSON();
};

/**
 * @description Marks the user's email as verified. This is typically called after successful OTP verification. It checks if the user exists and updates the emailVerified field to true. If the user is not found, it throws a 404 Not Found error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const verifyUserEmail = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }
  user.emailVerified = true;
  await user.save();
};

/**
 * @description Checks the provided email and password against the database for login. It verifies if the user exists and if the password is correct. If the email is not found, it throws a 404 Not Found error. If the password is incorrect, it throws a 401 Unauthorized error.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('./user.model.js').UserFields>}
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const checkLoginCredentials = async (email, password) => {
  const user = await User.findOne({ email, emailVerified: true }).select(
    '+password'
  );
  if (!user) {
    throw new ApiError(401, 'Incorrect email or password', [
      {
        field: 'email',
        constraint: 'incorrect',
        message: 'Incorrect email or password',
      },
    ]);
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect email or password', [
      {
        field: 'password',
        constraint: 'incorrect',
        message: 'Incorrect email or password',
      },
    ]);
  }

  return user.toJSON();
};

/**
 * @description Retrieves the user profile based on the provided user ID. It checks if the user exists and returns the user data. If the user is not found, it throws a 404 Not Found error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @returns {Promise<import('./user.model.js').UserFields>}
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const getUserProfile = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }
  return user.toJSON();
};

export { createUser, verifyUserEmail, checkLoginCredentials, getUserProfile };
