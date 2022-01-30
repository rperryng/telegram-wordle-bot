import { Context } from 'telegraf';
import * as models from '../models';
import { current as currentWordleNumber } from '../wordle/number';
import { PrivateMessage } from './types';

export async function handler(
  context: Context,
  message: PrivateMessage,
): Promise<void> {
  const userId = message.from.id;
  const wordleNumber = currentWordleNumber();

  const submission = await models.submission.get(userId, wordleNumber);

  if (!submission) {
    context.reply(
      `No submission found for Wordle #${wordleNumber} ${message.from.first_name}`,
    );
  } else {
    context.reply(`wordle #${submission.wordleNumber}
Number of guesses: ${submission.guesses.split('\n').length}
guesses:
${submission.guesses}`);
  }
}
