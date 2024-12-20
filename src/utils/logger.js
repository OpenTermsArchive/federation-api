import os from 'os';

import config from 'config';
import winston from 'winston';
import 'winston-mail';

const { combine, timestamp, printf, colorize } = winston.format;

const transports = [new winston.transports.Console({ silent: process.env.NODE_ENV === 'test' })];

const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
    printf(({ level, message, timestamp }) => {
      const timestampPrefix = config.get('@opentermsarchive/federation-api.logger.timestampPrefix') ? `${timestamp} ` : '';

      return `${timestampPrefix}${level.padEnd(15)} ${message}`;
    }),
  ),
  transports,
  rejectionHandlers: transports,
});

if (config.get('@opentermsarchive/federation-api.logger.sendMailOnError')) {
  if (process.env.OTA_FEDERATION_API_SMTP_PASSWORD === undefined) {
    logger.warn('Environment variable "OTA_FEDERATION_API_SMTP_PASSWORD" was not found; log emails cannot be sent');
  } else {
    transports.push(new winston.transports.Mail({
      to: config.get('@opentermsarchive/federation-api.logger.sendMailOnError.to'),
      from: config.get('@opentermsarchive/federation-api.logger.sendMailOnError.from'),
      host: config.get('@opentermsarchive/federation-api.logger.smtp.host'),
      username: config.get('@opentermsarchive/federation-api.logger.smtp.username'),
      password: process.env.OTA_FEDERATION_API_SMTP_PASSWORD,
      ssl: true,
      timeout: 30 * 1000,
      formatter: args => args[Object.getOwnPropertySymbols(args)[1]], // Returns the full error message, the same that is visible in the console. It is referenced in the argument object with a Symbol of which we do not have the reference to but we know it is the second one.
      exitOnError: true,
      level: 'error',
      subject: `[OTA] [Federation API] Error — ${os.hostname()}`,
    }));

    logger.configure({
      transports,
      rejectionHandlers: transports,
    });
  }
}

export default logger;
