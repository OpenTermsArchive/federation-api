import os from 'os';

import config from 'config';
import dotenv from 'dotenv';
import winston from 'winston';
import 'winston-mail';

dotenv.config();

const { combine, timestamp, printf, colorize } = winston.format;

const transports = [new winston.transports.Console()];

const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => `${timestamp} ${level.padEnd(15)} ${message}`),
  ),
  transports,
  rejectionHandlers: transports,
});

if (config.get('logger.sendMailOnError')) {
  if (process.env.SMTP_PASSWORD) {
    logger.warn('Environment variable "SMTP_PASSWORD" was not found; log emails cannot be sent');
  } else {
    transports.push(new winston.transports.Mail({
      to: config.get('logger.sendMailOnError.to'),
      from: config.get('logger.sendMailOnError.from'),
      host: config.get('logger.smtp.host'),
      username: config.get('logger.smtp.username'),
      password: process.env.SMTP_PASSWORD,
      ssl: true,
      timeout: 30 * 1000,
      formatter: args => args[Object.getOwnPropertySymbols(args)[1]], // Returns the full error message, the same that is visible in the console. It is referenced in the argument object with a Symbol of which we do not have the reference to but we know it is the second one.
      exitOnError: true,
      level: 'error',
      subject: `[OTA] [Federated API] Error — ${os.hostname()}`,
    }));

    logger.configure({
      transports,
      rejectionHandlers: transports,
    });
  }
}

export default logger;
