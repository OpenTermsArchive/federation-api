import express from 'express';

import { getCollections } from '../controllers/collections.js';

const router = express.Router();

router.get('/collections', getCollections);

export default router;
