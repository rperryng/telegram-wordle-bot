import { PrivateMessage } from './types';
import * as models from '../models';
import { Context } from 'telegraf';
import { env } from '../env';

export const config = {
  wordleNumber: parseInt(env('WORDLE_NUMBER', '210')),
};

export async function handler(
  context: Context,
  message: PrivateMessage,
): Promise<void> {
  const userId = message.from.id;
  const { wordleNumber } = config;

  const submission = await models.submission.get(userId, wordleNumber);

  if (!submission) {
    context.reply(
      `No submission found for Wordle #${wordleNumber} ${message.chat.username}`,
    );
  } else {
    context.reply(`Worldle #${submission.wordleNumber}
Number of guesses: ${submission.guesses.split('\n').length}
guesses:
${submission.guesses}`);
  }
}
