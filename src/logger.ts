import { createLogger, format, transports } from 'winston';
import { env } from './env';

const config = {
  logLevel: env('LOG_LEVEL', 'info'),
};

export const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp({
      format: 'isoDateTime',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    format.printf((log) => `${log.timestamp} [${log.level}] - ${log.message}`),
  ),
  defaultMeta: { service: 'telegram-wordle-bot' },
  transports: [
    new transports.Console({
      level: config.logLevel,
    }),
  ],
});
