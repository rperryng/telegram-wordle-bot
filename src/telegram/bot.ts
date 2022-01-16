import { Telegraf, Context } from 'telegraf';
import { logger } from '../logger';
import { messageSchema } from './types';
import { env } from '../env';
import { handle as handleSubmission } from './submission';
import { handle as handleFetch } from './fetch';

const config = {
  botToken: env('TELEGRAM_BOT_KEY'),
};

export const bot = new Telegraf(config.botToken);

bot.start((context) => context.reply('Hello'));

bot.on('inline_query', (_context: Context) => {
  logger.info('received inline query');
});

bot.on('text', (context: Context) => {
  const message = messageSchema.parse(context.message);

  if (message.text === 'fetch') {
    return handleFetch(context, message);
  } else if (message.text.startsWith('Wordle')) {
    return handleSubmission(context, message);
  } else {
    context.reply("I didn't understand that");
  }
});
