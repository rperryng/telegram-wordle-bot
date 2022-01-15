import { Telegraf } from "telegraf";

const telegram_bot_token = process.env.TELEGRAM_API_KEY;
if (telegram_bot_token === undefined) {
  throw new Error("missing TELEGRAM_API_KEY");
}

export const bot = new Telegraf(telegram_bot_token, {
  telegram: { webhookReply: true },
});

bot.start((context) => context.reply("Hello"));
