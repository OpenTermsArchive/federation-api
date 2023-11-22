import config from 'config';
import express from 'express';

import apiRouter from './routes/index.js';

const app = express();


export const basePath = '/v1';

app.use(basePath, apiRouter());

const port = config.get('port');

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
