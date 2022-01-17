import { Telegraf, Context } from 'telegraf';
import { logger } from '../logger';
import { messageSchema, privateMessageSchema } from './types';
import { env } from '../env';
import { handler as handleSubmission } from './submission';
import { handler as handleFetch } from './fetch';
import { handler as handleToday } from './today';
import { handler as handleRegister } from './register';
import { handler as handleUnregister } from './unregister';
import { handler as handleDelete } from './delete';

const config = {
  botToken: env('TELEGRAM_BOT_KEY'),
};

export const bot = new Telegraf(config.botToken);

bot.start((context) =>
  context.reply(
    `
Hello!

To submit your wordle solution, paste the "Share" output in a private chat with me.

After inviting me to a group chat, type \`/register\`
Once everyone in that chat who has \`registered\`, I will paste a summary of everyone's submissions for that wordle day.

You can type \`/today\` in a group chat to get a (discreet) summary for registered users who have submitted their solution already.
`.trim(),
  ),
);
bot.command('delete', handleDelete);
bot.command('register', handleRegister);
bot.command('unregister', handleUnregister);
bot.command('today', handleToday);
bot.command('leaderboard', () => {
  logger.info('[leaderboard] command received');
});
bot.on('text', (context: Context) => {
  let message = messageSchema.parse(context.message);

  if (message.chat.type === 'group') {
    return context.reply("I didn't understand that");
  }

  message = privateMessageSchema.parse(context.message);

  if (message.text === 'fetch') {
    return handleFetch(context, message);
  } else if (message.text.startsWith('Wordle')) {
    return handleSubmission(context, message);
  } else {
    return context.reply("I didn't understand that");
  }
});
