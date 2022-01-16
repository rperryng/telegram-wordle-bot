import { Context } from 'telegraf';
import { logger } from '../logger';

export async function handler(context: Context) {
  logger.info('[today] command received');

  logger.info(`message: ${JSON.stringify(context.message, null, 2)}`);
}
