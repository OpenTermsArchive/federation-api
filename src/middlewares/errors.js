import logger from '../utils/logger.js';

function errorsMiddleware(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).json({ error: err.message });
}

export default errorsMiddleware;
