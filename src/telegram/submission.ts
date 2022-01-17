import { logger } from '../logger';
import { PrivateMessage, submissionSchema } from './types';
import * as models from '../models';
import { Context } from 'telegraf';

const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>\d)\/6\s+(?<guesses>(?:(?:\u{1F7E9}|\u{1F7E8}|\u{2B1C}|\u{2B1B}){5}\s?){1,6})$/u;

export async function handler(
  context: Context,
  message: PrivateMessage,
): Promise<void> {
  // remove unicode variations
  const sanitizedText = message.text.replace(/\u{FE0F}/gu, '');

  const match = sanitizedText.match(WORDLE_SHARE_PATTERN);
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
    userName: message.from.username,
  });

  context.reply(`Thank you for your submission ${message.from.username}
Worldle #${submission.wordleNumber}
Number of guesses: ${submission.numGuesses}
guesses:
${submission.guesses}`);
}

function checkGroups(userId: number) {
  logger.info('Checking if any group summaries are ready...');

  const groupIds = models.groupUsers.getGroupIds(userId);
}
