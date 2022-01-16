import { Telegraf, Context } from 'telegraf';
import { logger } from '../logger';
import { messageSchema, Message, submissionSchema, Submission } from './types';
import { env } from '../env';
import * as models from '../models';

const config = {
  botToken: env('TELEGRAM_BOT_KEY'),
  wordleNumber: parseInt(env('WORDLE_NUMBER', '210')),
};

const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>\d)\/6\s+(?<guesses>(.+))/msu;

export const bot = new Telegraf(config.botToken);

bot.start((context) => context.reply('Hello'));

bot.on('text', (context: Context) => {
  const message = messageSchema.parse(context.message);

  if (message.text === 'fetch') {
    return handleFetch(context, message);
  }

  const match = message.text.match(WORDLE_SHARE_PATTERN);
  if (!match || !match.groups) {
    logger.info('board not valid');
    context.reply('this board is not valid');
    return;
  }

  const submission = submissionSchema.parse(match.groups);
  handleSubmission(context, message, submission);
});

export async function handleFetch(
  context: Context,
  message: Message
): Promise<void> {
  const userId = message.from.id;
  const { wordleNumber } = config;

  const submission = await models.submission.get(userId, wordleNumber);

  if (!submission) {
    context.reply(
      `No submission found for Wordle #${wordleNumber} ${message.chat.username}`
    );
  } else {
    context.reply(`Worldle #${submission.wordleNumber}
Number of guesses: ${submission.guesses.split('\n').length}
guesses:
${submission.guesses}`);
  }
}

export async function handleSubmission(
  context: Context,
  message: Message,
  submission: Submission
): Promise<void> {
  logger.info('saving submission');
  const result = await models.submission.put({
    ...submission,
    userId: message.from.id,
  });

  context.reply(`Thank you for your submission ${message.from.username}
Worldle #${submission.wordleNumber}
Number of guesses: ${submission.numGuesses}
guesses:
${submission.guesses}`);
}
