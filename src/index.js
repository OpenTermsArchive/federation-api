import config from 'config';
import express from 'express';
import 'express-async-errors';

import errorsMiddleware from './middlewares/errors.js';
import loggerMiddleware from './middlewares/logger.js';
import apiRouter from './routes/index.js';
import logger from './utils/logger.js';

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(loggerMiddleware);
}

export const BASE_PATH = `/${config.get('@opentermsarchive/federation-api.basePath')}/v1`.replace(/\/\/+/g, '/'); // ensure there are no double slashes

app.use(BASE_PATH, apiRouter(BASE_PATH));
app.use(errorsMiddleware);

const PORT = config.get('@opentermsarchive/federation-api.port');

app.listen(PORT, () => {
  logger.info(`Start Open Terms Archive Federation API on http://localhost:${PORT}${BASE_PATH}`);
});

export default app;
