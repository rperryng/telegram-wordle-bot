import { Telegraf, Context } from 'telegraf';
import { logger } from '../logger';
import { messageSchema } from './types';
import { z } from 'zod';

const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>\d)\/6\s+(?<guesses>(.+))/msu;

const submissionSchema = z.object({
  wordleNumber: z.number(),
  numGuesses: z.number(),
  guesses: z.optional(z.string()),
});

const telegram_bot_token = process.env.TELEGRAM_API_KEY;
if (!telegram_bot_token) {
  throw new Error('missing TELEGRAM_API_KEY');
}

export const bot = new Telegraf(telegram_bot_token);

bot.start((context) => context.reply('Hello'));

bot.on('text', (context: Context) => {
  const message = messageSchema.parse(context.message);
  logger.info(`[message]: ${message.text}`);

  const match = message.text.match(WORDLE_SHARE_PATTERN);

  if (!match || !match.groups) {
    logger.info('board not valid');
    context.reply('this board is not valid');
    return;
  }

  logger.info(`guessesRaw: ${match.groups.guesses}`);
  logger.info(`submission parsed: ${JSON.stringify(match.groups, null, 2)}`);

  const submission = submissionSchema.parse({
    wordleNumber: parseInt(match.groups.wordleNumber),
    numGuesses: parseInt(match.groups.numGuesses),
    guesses: match.groups.guesses,
  });

  context.reply(`Thank you for your submission ${message.from.username}
Worldle #${submission.wordleNumber}
Number of guesses: ${submission.numGuesses}
guesses:
${submission.guesses}`);

  logger.info('succeeded');
});
