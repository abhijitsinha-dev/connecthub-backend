import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { seedDemoData, clearDemoData } from './seed.service.js';

const seedData = asyncHandler(async (req, res) => {
  let { users, posts } = req.query;
  users = parseInt(users) || 10;
  posts = parseInt(posts) || 3;

  const result = await seedDemoData(users, posts);
  ApiResponse.CREATED(result, 'Demo data seeded successfully').send(res);
});

const clearData = asyncHandler(async (req, res) => {
  await clearDemoData();
  ApiResponse.OK({}, 'Demo data cleared successfully').send(res);
});

export { seedData, clearData };
