import { logger } from '../logger';
import { PrivateMessage, submissionSchema } from './types';
import * as models from '../models';
import { Context } from 'telegraf';
import { getSummary } from '../services/summary';
import { bot } from './bot';

const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>\d)\/6\s+(?<guesses>(?:(?:\u{1F7E9}|\u{1F7E8}|\u{2B1C}|\u{2B1B}){5}\s?){1,6})$/u;

export async function handler(context: Context, message: PrivateMessage) {
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

  const chatIds = await models.groupUsers.getGroupIds(message.from.id);

  await Promise.all(
    chatIds.map(async (chatId) => {
      const summary = await getSummary(chatId);
      switch (summary.type) {
        case 'full':
        case 'discreet': {
          const msg = `All submissions received!\n\n${summary.message}`;
          await bot.telegram.sendMessage(chatId, msg);
          break;
        }
        case 'needs_setup':
        // do nothing
      }
    }),
  );
}
