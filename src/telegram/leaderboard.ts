import { Context } from 'telegraf';
import { messageSchema } from './types';
import { logger } from '../logger';
import { get as getLeaderboard } from '../services/leaderboard';

export async function handler(context: Context) {
  logger.info('leaderboard command received');

  const message = messageSchema.parse(context.message);

  if (message.chat.type === 'private') {
    return context.reply('/leaderboard can only be used in group chats');
  }

  const msg = await getLeaderboard(message.chat.id);
  return context.reply(msg);
}
