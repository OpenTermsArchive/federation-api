import express from 'express';

import collectionsRouter from './collections.js';
import servicesRouter from './services.js';

export default function apiRouter() {
  const router = express.Router();

  router.use(collectionsRouter);
  router.use(servicesRouter);

  return router;
}
