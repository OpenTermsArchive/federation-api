import logger from "../utils/logger.js";

export default function errorsMiddleware(err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send('Something went wrong!');
}