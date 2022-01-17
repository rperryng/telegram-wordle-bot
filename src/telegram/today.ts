import { Context } from 'telegraf';
import { logger } from '../logger';
import * as models from '../models';
import { commandSchema } from './types';
import { config } from './fetch';

export async function handler(context: Context) {
  logger.info('[today] command received');
  const message = commandSchema.parse(context.message);
  const userIds = await models.groupUsers.getUserIds(message.chat.id);

  if (!userIds) {
    return context.reply(`No registered users found for ${message.chat.title}`);
  }

  return await models.submission.batchGet(userIds, config.wordleNumber);
}
