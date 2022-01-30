import { Context } from 'telegraf';
import * as models from '../models';
import { messageSchema } from './types';
import { getUsername } from './userUtils';

export async function handler(context: Context) {
  const message = messageSchema.parse(context.message);

  if (message.chat.type === 'private') {
    return context.reply('/unregister is not supported in private chats');
  }

  await models.chatUsers.deleteItem({
    chatId: message.chat.id,
    userId: message.from.id,
  });

  const userName = await getUsername(message.chat.id, message.from.id);

  return context.reply(
    `Okay!  I won't wait for ${userName} to submit their solution anymore before posting a summary in ${message.chat.title}`,
  );
}
