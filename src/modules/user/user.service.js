import ApiError from '../../utils/ApiError.js';
import { deleteMedia } from '../media/media.service.js';
import User from './user.model.js';
import Follow from '../follow/follow.model.js';

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
  user.status = 'active';
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
const getUserById = async userId => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }
  return user.toJSON();
};

const getUserByEmail = async email => {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.NOT_FOUND('email');
  }
  return user.toJSON();
};

/**
 * @description Resets the user's password to a new value. This is typically called after successful password reset token verification. It checks if the user exists, updates the password, and saves the user document. If the user is not found, it throws a 404 Not Found error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @param {string} newPassword
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const resetUserPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }
  user.password = newPassword;
  await user.save();
};

/**
 * @description Updates the user's profile information based on the provided user ID and update data. It checks if the user exists, applies the updates, and saves the user document. If the user is not found, it throws a 404 Not Found error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @param {Object} updateData - An object containing the fields to be updated (e.g., username, fullName, phoneNumber, avatar, coverImage)
 * @returns {Promise<import('./user.model.js').UserFields>}
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const updateUserById = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }

  const { avatar, coverImage } = updateData;

  if (avatar || avatar === null)
    await deleteMedia(user.avatar.publicId, 'image');
  if (coverImage || coverImage === null)
    await deleteMedia(user.coverImage.publicId, 'image');

  Object.assign(user, updateData);
  return (await user.save()).toJSON();
};

const searchUsersAtlas = async searchTerm => {
  if (!searchTerm || searchTerm.trim().length === 0) return [];

  const pipeline = [
    {
      $search: {
        index: 'user_search',
        // 'compound' lets us search multiple fields at once
        compound: {
          should: [
            {
              // Search-As-You-Type on Username
              autocomplete: {
                query: searchTerm,
                path: 'username',
                fuzzy: { maxEdits: 1, prefixLength: 1 }, // Allows 1 typo
              },
            },
            {
              // Search-As-You-Type on Full Name
              autocomplete: {
                query: searchTerm,
                path: 'fullName',
                fuzzy: { maxEdits: 1, prefixLength: 1 }, // Allows 1 typo
              },
            },
          ],
        },
      },
    },
    { $limit: 15 },
    {
      $project: {
        _id: 0,
        id: '$_id',
        username: 1,
        fullName: 1,
        avatar: 1,
        score: { $meta: 'searchScore' },
      },
    },
  ];

  try {
    const users = await User.aggregate(pipeline);
    return users;
  } catch (error) {
    console.error('🔴 ATLAS SEARCH FATAL ERROR:', error.message);
    throw error;
  }
};

/**
 * @description Retrieves a user's profile information based on their username. It checks if the user exists and returns the user data. If the user is not found, it throws a 404 Not Found error.
 * @param {string} username
 * @param {string} [visitorId] - The ID of the user viewing the profile
 * @returns {Promise<import('./user.model.js').UserFields & { isFollowedByCurrentUser: boolean | null }>}
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const findUserByUsername = async (username, visitorId) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw ApiError.NOT_FOUND('username');
  }

  const result = user.toJSON();

  if (visitorId) {
    if (visitorId.toString() === user._id.toString()) {
      result.isFollowedByCurrentUser = null;
    } else {
      const follow = await Follow.findOne({
        follower: visitorId,
        following: user._id,
      }).select('_id');
      result.isFollowedByCurrentUser = !!follow;
    }
  }

  return result;
};

/**
 * @description Changes the user's password after verifying the current password. It checks if the user exists, verifies the current password, and updates to the new password. If the user is not found, it throws a 404 Not Found error. If the current password is incorrect, it throws a 401 Unauthorized error.
 * @param {import('mongoose').Schema.Types.ObjectId} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @throws {import('../utils/ApiError.js').ApiError}
 */
const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.NOT_FOUND('userId');
  }

  const isMatch = await user.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Old password is incorrect', [
      {
        field: 'oldPassword',
        constraint: 'incorrect',
        message: 'Old password is incorrect',
      },
    ]);
  }

  user.password = newPassword;
  return (await user.save()).toJSON();
};
export {
  createUser,
  verifyUserEmail,
  checkLoginCredentials,
  resetUserPassword,
  getUserById,
  getUserByEmail,
  updateUserById,
  searchUsersAtlas,
  findUserByUsername,
  changeUserPassword,
};
