import { Context } from 'telegraf';
import { messageSchema, privateMessageSchema } from './types';
import { current as currentWordleNumber } from '../wordle-number';
import * as models from '../models';

export async function handler(context: Context) {
  let message = messageSchema.parse(context.message);

  if (message.chat.type === 'group') {
    return context.reply('/delete can only be used in the private message');
  }

  message = privateMessageSchema.parse(context.message);

  const wordleNumber = currentWordleNumber();
  await models.submission.deleteItem({
    userId: message.from.id,
    wordleNumber: currentWordleNumber(),
  });
  context.reply(`Ok, I've removed your entry for wordle ${wordleNumber}`);
}
