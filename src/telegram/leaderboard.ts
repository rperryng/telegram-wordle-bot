import { Context } from 'telegraf';
import { messageSchema } from './types';
import { logger } from '../logger';
import { get as getLeaderboard, Timeframe } from '../services/leaderboard';

const leaderboardTimeframe =
  /\/leaderboard\s*(?<timeframe>week|month|all\s())?/;

export async function handler(context: Context) {
  logger.info('leaderboard command received');

  const message = messageSchema.parse(context.message);

  if (message.chat.type === 'private') {
    return context.reply('/leaderboard can only be used in group chats');
  }

  logger.info(`leaderboard text: ${message.text}`);

  const match = message.text.match(leaderboardTimeframe);
  if (!match) {
    return context.reply("I didn't understand that");
  }

  const timeframe = parseTimeframeText(match.groups?.timeframe);

  const msg = await getLeaderboard(message.chat.id, timeframe);
  return context.reply(msg);
}

export function parseTimeframeText(timeframe: string | undefined): Timeframe {
  switch (timeframe) {
    case 'month':
      return Timeframe.MONTH;
    case 'week':
      return Timeframe.WEEK;
    default:
      return Timeframe.ALL_TIME;
  }
}
