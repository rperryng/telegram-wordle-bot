import { Context, Next } from 'koa';
import { logger } from '../logger';

export function logBody(context: Context, next: Next) {
  logger.info(
    `got request body: \n${JSON.stringify(context.request.body, null, 2)}`
  );
  return next();
}
