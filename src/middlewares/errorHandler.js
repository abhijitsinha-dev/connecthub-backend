import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';

/**
 * @description Global error handling middleware for Express.js applications.
 * @type {import('express').ErrorRequestHandler}
 * @returns {import('express').Response}
 */
const errorHandler = (err, _req, res, _next) => {
  console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.data = err.data || null;
  err.errors = err.errors || {};

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV !== 'production') return;

  let error = { ...err };
  error.message = err.message;

  // Mongo Unique Constraint Error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    // error = ApiError.UNIQUE(err);
    const field = Object.keys(err.keyValue)[0];

    const message = `${field} already exists`;

    error = new ApiError(409, message, [
      {
        field,
        constraint: 'unique',
        message: `${field} already exists`,
      },
    ]);
  }

  // Mongoose Validation Error
  if (
    err.name === 'ValidationError' &&
    err instanceof mongoose.Error.ValidationError
  ) {
    // error = ApiError.MONGO_VALIDATION_ERROR(err);
    const errors = Object.values(err.errors).map(el => {
      const constraint = el.kind || el.name;

      const message =
        el.name === 'CastError'
          ? `${el.path} must be a ${el.kind}`
          : el.message;

      return {
        field: el.path,
        constraint,
        message,
      };
    });

    const message = `Validation failed: ${errors.length} error${errors.length > 1 ? 's' : ''} found`;

    error = new ApiError(400, message, errors);
  }

  // Joi Validation Error
  if (err.name === 'ValidationError' && err.isJoi) {
    const errors = err.details.map(el => {
      const constraint = el.type;
      return {
        field: el.path[0],
        constraint,
        message: el.message,
      };
    });

    const message = `Validation failed: ${errors.length} error${errors.length > 1 ? 's' : ''} found`;

    error = new ApiError(400, message, errors);
  }

  sendErrorProd(error, res);
};

export default errorHandler;

// In development, we send detailed error information to the client for easier debugging. This includes the stack trace and all error details.
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status || 'error',
    message: err.message,
    data: err.data,
    errors: err.errors || [],
    stack: err.stack,
  });
};

// In production, we only send operational errors to the client. Programming or unknown errors are not sent in detail to avoid leaking information.
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || [],
      data: err.data,
    });
  } else {
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      error: [],
      data: null,
    });
  }
};
