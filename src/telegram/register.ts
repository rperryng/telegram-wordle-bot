import { Context } from 'telegraf';
import { logger } from '../logger';
import * as models from '../models';
import { groupMessageSchema, messageSchema } from './types';

export async function handler(context: Context) {
  logger.info('parsing register');
  const message = messageSchema.parse(context.message);
  logger.info('parsed register message');

  if (message.chat.type === 'private') {
    return context.reply('/register is not supported in private chats');
  }

  // Shouldn't have to do this
  logger.info('parsing group message');
  const groupMessage = groupMessageSchema.parse(context.message);
  logger.info('parsed group message');

  await models.chatUsers.put({
    chatId: message.chat.id,
    userId: message.from.id,
  });
  return context.reply(
    `Okay!  I will wait for ${message.from.first_name} to send me Wordle scores before posting full summaries in ${message.chat.title}`,
  );
}
