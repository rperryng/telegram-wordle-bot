import { Telegraf, Context } from 'telegraf';
import { messageSchema, privateMessageSchema } from './types';
import { env } from '../env';
import { handler as handleSubmission } from './submission';
import { handler as handleFetch } from './fetch';
import { handler as handleSummary } from './summary';
import { handler as handleRegister } from './register';
import { handler as handleUnregister } from './unregister';
import { handler as handleDelete } from './delete';
import { handler as handleLeaderboard } from './leaderboard';

const config = {
  botToken: env('TELEGRAM_BOT_KEY'),
};

export const bot = new Telegraf(config.botToken);

bot.start((context) =>
  context.reply(
    `
Hello!

To submit your wordle solution, paste the "Share" output in a private chat with me.

After inviting me to a group chat, type /register
Once all the registered users in that chat have submitted their Wordle share pattern, I will paste a summary of everyone's submissions for that wordle day.

You can type /summary in a group chat to get a (discreet) summary for registered users who have submitted their solution already.

You can type /leaderboard to see the players ranked by their average number of guesses
`.trim(),
  ),
);
bot.command('delete', handleDelete);
bot.command('register', handleRegister);
bot.command('unregister', handleUnregister);
bot.command('summary', handleSummary);
bot.command('leaderboard', handleLeaderboard);

bot.command('today', (context: Context) => {
  return context.reply('/today is deprecated, please use /summary instead');
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
