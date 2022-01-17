import { Context } from 'telegraf';
import { messageSchema } from './types';
import { getSummary } from '../services/summary';
import { logger } from '../logger';

export async function handler(context: Context) {
  logger.info('[today] parsing message');
  const message = messageSchema.parse(context.message);
  logger.info('[today] parsed message');

  if (message.chat.type === 'private') {
    return context.reply(
      '/today is not supported in private chats.  Try pasting your wordle summary instead.',
    );
  }

  const summary = await getSummary(message.chat.id);
  context.reply(summary.message);
}
