import { Telegraf, Context } from 'telegraf';
import { logger } from '../logger';
import { messageSchema } from './types';
import { env } from '../env';
import { handler as handleSubmission } from './submission';
import { handler as handleFetch } from './fetch';
import { handler as handleToday } from './today';

const config = {
  botToken: env('TELEGRAM_BOT_KEY'),
};

export const bot = new Telegraf(config.botToken);

bot.use((context: Context, next) => {
  logger.info(`bot received: ${JSON.stringify(context.message, null, 2)}`);
  return next();
});

bot.start((context) => context.reply('Hello'));
bot.command('today', handleToday);
bot.command('leaderboard', (context: Context) => {
  logger.info('[leaderboard] command received');
});
bot.on('text', (context: Context) => {
  logger.info('on [text]');
  const message = messageSchema.parse(context.message);

  if (message.text === 'fetch') {
    return handleFetch(context, message);
  } else if (message.text.startsWith('Wordle')) {
    return handleSubmission(context, message);
  } else {
    context.reply("I didn't understand that");
  }
});
