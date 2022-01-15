import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({
      format: "isoDateTime",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    format.printf((log) => `${log.timestamp} [${log.level}] - ${log.message}`)
  ),
  defaultMeta: { service: "telegram-wordle-bot" },
  transports: [
    new transports.Console({
      level: process.env.LOG_LEVEL || "info",
    }),
  ],
});
