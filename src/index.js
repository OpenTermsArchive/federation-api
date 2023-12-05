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

export const BASE_PATH = '/v1';

app.use(BASE_PATH, apiRouter(BASE_PATH));
app.use(errorsMiddleware);
const port = config.get('port');

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

export default app;
