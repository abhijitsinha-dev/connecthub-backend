import { Router } from 'express';
import protect from '../../middlewares/protect.js';
import { getCloudinarySignature } from './media.controller.js';

const router = Router();

// This resolves to: GET /api/v1/get-signature
router.route('/get-signature').get(protect, getCloudinarySignature);

export default router;
