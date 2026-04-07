import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { generateCloudinarySignature } from './media.service.js';

/**
 * @description Generates a Cloudinary signature for secure client-side uploads. It creates a timestamp, defines a folder for uploads, and generates a signature using the Cloudinary API secret. The response includes the timestamp, signature, folder name, API key, and cloud name for use in client-side upload configurations.
 * @type {import('express').RequestHandler}
 * @returns {import('express').Response}
 */
const getCloudinarySignature = asyncHandler(async (_req, res, _next) => {
  const { timestamp, signature } = generateCloudinarySignature();

  // 4. Send response
  ApiResponse.OK(
    { timestamp, signature },
    'Cloudinary signature generated successfully'
  ).send(res);
});

export { getCloudinarySignature };
