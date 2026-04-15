import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

/**
 * @description This file defines the Mongoose schema and model for the User collection. It includes fields for username, email, password, and verification status, along with validation rules and a pre-save hook to hash passwords. The schema also sets up a TTL index to automatically delete unverified users after 24 hours.
 * @typedef {Object} UserFields
 * @property {mongoose.Schema.Types.ObjectId} id
 * @property {string} username
 * @property {string} fullName
 * @property {string} email
 * @property {boolean} emailVerified
 * @property {string} password
 * @property {string=} phoneNumber
 * @property {boolean=} phoneNumberVerified
 * @property {Object=} avatar
 * @property {Object=} coverImage
 * @property {string=} gender
 * @property {string=} bio
 * @property {Date=} dateOfBirth
 * @property {string=} address
 * @property {'active' | 'inactive' | 'deactivated' | 'deleted' | 'suspended'} status
 * @property {Array<mongoose.Schema.Types.ObjectId>} followers
 * @property {Array<mongoose.Schema.Types.ObjectId>} following
 * @property {boolean} isDemo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {UserFields & import('mongoose').Document} UserDocument
 */

/** @type {import('mongoose').Schema<UserFields>} */
const userSchema = new mongoose.Schema(
  {
    // Username must be unique, lowercase, and can only contain letters, numbers, underscores, and hyphens
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
      trim: true,
      minlength: [5, 'username length must be at least 5 characters long'],
      maxlength: [
        50,
        'username length must be less than or equal to 50 characters long',
      ],
      match: [
        /^[a-z0-9_-]+$/,
        'username must contain only lowercase letters, numbers, underscores, and hyphens',
      ],
      lowercase: true,
    },
    // Full name is optional but if provided, it must be between 5 and 50 characters long
    fullName: {
      type: String,
      trim: true,
      minlength: [5, 'fullName length must be at least 5 characters long'],
      maxlength: [
        50,
        'fullName length must be less than or equal to 50 characters long',
      ],
    },
    // Email must be unique, lowercase, and a valid email format
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'email must be a valid email',
        type: 'string.email',
      },
    },
    // Flag to indicate if the user's email has been verified. This is important for account activation and security.
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Password must be between 8 and 128 characters long and meet strong password criteria (at least one uppercase letter, one lowercase letter, one number, and one symbol)
    password: {
      type: String,
      required: true,
      minlength: [8, 'password length must be at least 8 characters long'],
      maxlength: [
        128,
        'password length must be less than or equal to 128 characters long',
      ],
      validate: {
        validator: validator.isStrongPassword,
        message:
          'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols',
        type: 'strongPassword',
      },
      select: false,
    },
    // Optional phone number field with validation to ensure it's a valid mobile phone number
    phoneNumber: {
      type: String,
      trim: true,
    },
    // Flag to indicate if the user's phone number has been verified. This can be used for additional security measures like two-factor authentication.
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    // Avatar field to store the URL and public ID of the user's profile picture. This allows for easy integration with cloud storage services like Cloudinary.
    avatar: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    // Cover image field to store the URL and public ID of the user's cover photo. This enhances the user's profile customization options.
    coverImage: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    // Optional gender
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer not to say'],
    },
    // Optional bio field with a maximum length of 200 characters to allow users to share a brief description about themselves.
    bio: {
      type: String,
      trim: true,
      maxlength: [
        200,
        'bio length must be less than or equal to 200 characters long',
      ],
    },
    // Optional date of birth field to allow users to share their birthdate if they choose to. This can be used for age verification or personalized content.
    dateOfBirth: {
      type: Date,
      default: null,
    },
    // Optional address field with a maximum length of 200 characters to allow users to share their location if they choose to.
    address: {
      type: String,
      trim: true,
      maxlength: [
        200,
        'address length must be less than or equal to 200 characters long',
      ],
    },
    // Status field to represent the user's account state. This can be used to manage user access and visibility on the platform.
    status: {
      type: String,
      enum: ['active', 'inactive', 'deactivated', 'deleted', 'suspended'],
      default: 'inactive',
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // A flag to indicate if this user is part of demo data. This can be useful for filtering out demo users in production.
    isDemo: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true, // This automatically adds 'id' based on '_id'
      versionKey: false, // This automatically removes '__v'
      transform: function (_doc, ret) {
        delete ret._id; // Remove the original _id
        delete ret.password; // Remove sensitive data
        return ret;
      },
    },

    toObject: {
      virtuals: true, // This automatically adds 'id' based on '_id'
      versionKey: false, // This automatically removes '__v'
      transform: function (_doc, ret) {
        delete ret._id; // Remove the original _id
        delete ret.password; // Remove sensitive data
        return ret;
      },
    },
  }
);

// TTL index to automatically delete unverified users after 24 hours
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60, // 24 hrs
    partialFilterExpression: { emailVerified: false },
  }
);
// Index to optimize queries for searching users by username and email
userSchema.index({ fullName: 1 });

// Pre-save hook to hash password if it's new or modified
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

/**
 * @description Compares a plain text password with the hashed password in the database
 * @param {string} enteredPassword - The password provided by the user during login
 * @returns {Promise<boolean>} - Returns true if they match, false otherwise
 */
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/** @type {import('mongoose').Model<UserDocument>} */
const User = mongoose.model('User', userSchema);

export default User;
