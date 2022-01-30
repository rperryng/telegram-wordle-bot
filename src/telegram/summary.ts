import { Context } from 'telegraf';
import { getSummary } from '../services/summary';
import { logger } from '../logger';
import { messageSchema } from './types';

export async function handler(context: Context) {
  logger.info('[summary] parsing message');
  const message = messageSchema.parse(context.message);
  logger.info('[summary] parsed message');

  if (message.chat.type === 'private') {
    return context.reply(
      '/summary is not supported in private chats.  Try pasting your wordle summary instead.',
    );
  }

  const summary = await getSummary(message.chat.id);
  context.reply(summary.message);
}
