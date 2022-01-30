import { Context } from 'telegraf';
import { logger } from '../logger';
import * as models from '../models';
import { messageSchema } from './types';
import { getUsername } from './userUtils';

export async function handler(context: Context) {
  logger.info('parsing register');
  const message = messageSchema.parse(context.message);
  logger.info('parsed register message');

  if (message.chat.type === 'private') {
    return context.reply('/register is not supported in private chats');
  }

  const userName = await getUsername(message.chat.id, message.from.id);

  await models.chatUsers.put({
    chatId: message.chat.id,
    userId: message.from.id,
  });
  return context.reply(
    `Okay!  I will wait for ${userName} (and everyone else who has called /register) to send me Wordle scores before posting full summaries in ${message.chat.title}`,
  );
}
