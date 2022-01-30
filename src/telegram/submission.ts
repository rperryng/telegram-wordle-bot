import { Context } from 'telegraf';
import { logger } from '../logger';
import * as models from '../models';
import { getSummary } from '../services/summary';
import { parse } from '../wordle/pattern';
import { bot } from './bot';
import { PrivateMessage } from './types';
import { getUsername } from './userUtils';

export async function handler(context: Context, message: PrivateMessage) {
  const submission = parse(message.text);
  if (!submission) {
    return context.reply('This board is not valid');
  }

  const userId = message.from.id;
  const userName = await getUsername(message.chat.id, userId);

  logger.info('saving submission');
  await models.submission.put({
    ...submission,
    userId: message.from.id,
  });

  context.reply(`Thank you for your submission ${userName}
Wordle #${submission.wordleNumber}
Number of guesses: ${submission.numGuesses}
guesses:
${submission.guesses}`);

  const chatIds = await models.chatUsers.getChatIds(message.from.id);

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        await postSummary(chatId);
      } catch (e) {
        if (e instanceof Error && e.message.includes('Forbidden')) {
          // TODO: Remove this chat so we don't try again in the future
          return logger.error(`Bot was kicked from chat ${chatId}`);
        }

        throw e;
      }
    }),
  );
}

async function postSummary(chatId: string): Promise<void> {
  const summary = await getSummary(chatId);
  switch (summary.type) {
    case 'full': {
      const msg = `All submissions received!\n\n${summary.message}`;
      await bot.telegram.sendMessage(chatId, msg);
      break;
    }
    case 'discreet':
    case 'needs_setup':
    // do nothing
  }
}
