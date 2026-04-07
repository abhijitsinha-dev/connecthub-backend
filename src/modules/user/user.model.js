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
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {UserFields & import('mongoose').Document} UserDocument
 */

/** @type {import('mongoose').Schema<UserFields>} */
const userSchema = new mongoose.Schema(
  {
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

    fullName: {
      type: String,
      trim: true,
      minlength: [5, 'fullName length must be at least 5 characters long'],
      maxlength: [
        50,
        'fullName length must be less than or equal to 50 characters long',
      ],
    },

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

    emailVerified: {
      type: Boolean,
      default: false,
    },

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

    phoneNumber: {
      type: String,
      trim: true,
    },

    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },

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

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer not to say'],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [
        200,
        'bio length must be less than or equal to 200 characters long',
      ],
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [
        200,
        'address length must be less than or equal to 200 characters long',
      ],
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
