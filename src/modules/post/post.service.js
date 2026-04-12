import Post from './post.model.js';

/**
 * @description Creates a new post with the provided data.
 * @param {Object} postData
 * @returns {Promise<Object>}
 */
const createPostService = async (postData) => {
  const newPost = await Post.create(postData);
  return newPost.toJSON();
};

export { createPostService };
