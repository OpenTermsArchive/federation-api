import express from 'express';

import { getServices, getService } from '../controllers/services.js';

const router = express.Router();

router.get('/services', getServices);
router.get('/service/:serviceId', getService);

export default router;
