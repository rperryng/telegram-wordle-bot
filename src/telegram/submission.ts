import { logger } from '../logger';
import { Message, submissionSchema } from './types';
import * as models from '../models';
import { Context } from 'telegraf';

const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>\d)\/6\s+(?<guesses>(.+))/msu;

export async function handle(
  context: Context,
  message: Message,
): Promise<void> {
  const match = message.text.match(WORDLE_SHARE_PATTERN);
  if (!match?.groups) {
    logger.info('board not valid');
    context.reply('this board is not valid');
    return;
  }

  const submission = submissionSchema.parse(match.groups);

  logger.info('saving submission');
  await models.submission.put({
    ...submission,
    userId: message.from.id,
  });

  context.reply(`Thank you for your submission ${message.from.username}
Worldle #${submission.wordleNumber}
Number of guesses: ${submission.numGuesses}
guesses:
${submission.guesses}`);
}
