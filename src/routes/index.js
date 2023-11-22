import express from 'express';

import collectionsRouter from './collections.js';
import servicesRouter from './services.js';
import docsRouter from './docs.js';

export default function apiRouter(basePath) {
  const router = express.Router();

  router.use(docsRouter(basePath));

  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to an instance of the Open Terms Archive Federated API. Documentation is available at /docs. Learn more on Open Terms Archive on https://opentermsarchive.org.' });
  });

  router.use(collectionsRouter);
  router.use(servicesRouter);

  return router;
}
