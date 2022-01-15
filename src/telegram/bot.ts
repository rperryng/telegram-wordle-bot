import { Telegraf, Context } from "telegraf";
import { logger } from "../logger";
import { messageSchema } from "./types";

const telegram_bot_token = process.env.TELEGRAM_API_KEY;
if (!telegram_bot_token) {
  throw new Error("missing TELEGRAM_API_KEY");
}

export const bot = new Telegraf(telegram_bot_token, {
  telegram: { webhookReply: true },
});

bot.start((context) => context.reply("Hello"));

bot.on("text", (context: Context) => {
  const message = messageSchema.parse(context.message);
  logger.info(`message: ${message.text}`);

  context.reply(`Hello ${message.from.username}`);
});
