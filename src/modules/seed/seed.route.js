import { Router } from 'express';
import { seedData, clearData } from './seed.controller.js';

const router = Router();

router.post('/', seedData);
router.delete('/', clearData);

export default router;
