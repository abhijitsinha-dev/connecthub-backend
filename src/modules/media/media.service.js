import cloudinary from './cloudinary.js';

const generateCloudinarySignature = () => {
  // 1. Create a Unix timestamp
  const timestamp = Math.round(new Date().getTime() / 1000);

  // 2. Define a folder in Cloudinary
  const folder = 'connecthub';

  // 3. Generate the signature
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return { timestamp, signature };
};

const deleteMedia = async (publicId, resourceType) => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export { generateCloudinarySignature, deleteMedia };
