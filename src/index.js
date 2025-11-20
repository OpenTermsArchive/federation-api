import config from 'config';
import express from 'express';
import 'express-async-errors';

import errorsMiddleware from './middlewares/errors.js';
import loggerMiddleware from './middlewares/logger.js';
import apiRouter from './routes/index.js';
import { fetchCollections } from './services/collections.js';
import logger from './utils/logger.js';

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(loggerMiddleware);
}

export const BASE_PATH = `/${config.get('@opentermsarchive/federation-api.basePath')}/v1`.replace(/\/\/+/g, '/'); // ensure there are no double slashes

app.use(BASE_PATH, apiRouter(BASE_PATH));
app.use(errorsMiddleware);

const PORT = config.get('@opentermsarchive/federation-api.port');

export async function initializeCollections(collectionsConfig) {
  try {
    const collections = await fetchCollections(collectionsConfig);

    if (!collections.length) {
      throw new Error('No valid collection declared, the process will exit as this API cannot fulfil any request');
    }

    return collections;
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

const collections = await initializeCollections(config.get('@opentermsarchive/federation-api.collections'));

app.locals.collections = collections;

app.listen(PORT, '127.0.0.1', () => {
  logger.info(`Start Open Terms Archive Federation API on http://localhost:${PORT}${BASE_PATH}`);
});

export default app;
