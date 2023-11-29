import config from 'config';
import express from 'express';
import 'express-async-errors';

import errorsMiddleware from './middlewares/errors.js';
import loggerMiddleware from './middlewares/logger.js';
import apiRouter from './routes/index.js';

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(loggerMiddleware);
}

export const basePath = '/v1';

app.use(basePath, apiRouter(basePath));
app.use(errorsMiddleware);
const port = config.get('port');

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
