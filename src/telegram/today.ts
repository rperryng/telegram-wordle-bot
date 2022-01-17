import { Context } from 'telegraf';
import * as models from '../models';
import { messageSchema } from './types';
import { checkSummary } from './summary-service';

type Submission = models.submission.Submission & {
  numGuesses: number;
};

export async function handler(context: Context) {
  const message = messageSchema.parse(context.message);
  const chatId = message.chat.id;
  const userIdsForChat = await models.groupUsers.getUserIds(chatId);

  if (message.chat.type === 'private') {
    return context.reply('/today is not supported in private chats');
  }

  const msg = await checkSummary(chatId);
  context.reply(msg);
}
