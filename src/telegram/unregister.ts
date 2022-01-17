import { Context } from 'telegraf';
import * as models from '../models';
import { groupMessageSchema, messageSchema } from './types';

export async function handler(context: Context) {
  const message = messageSchema.parse(context.message);

  if (message.chat.type === 'private') {
    return context.reply('/unregister is not supported in private chats');
  }

  // Shouldn't have to do this
  const groupMessage = groupMessageSchema.parse(context.message);

  models.chatUsers.deleteItem({
    chatId: message.chat.id,
    userId: message.from.id,
  });

  return context.reply(
    `Okay!  I won't wait for ${message.from.first_name} to submit before posting a summary in ${groupMessage.chat.title}`,
  );
}
