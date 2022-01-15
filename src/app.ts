import Koa, { Context, Next } from "koa";
import koaLogger from "koa-logger";
import koaBodyParser from "koa-bodyparser";
import serverless from "serverless-http";
import { logger } from "./logger";
import { notFound } from "./middlewares/not-found";
import { Telegraf } from "telegraf";

// Telegraf
const telegram_bot_token = process.env.TELEGRAM_API_KEY;
if (telegram_bot_token === undefined) {
  throw new Error("missing TELEGRAM_API_KEY");
}
const bot = new Telegraf(telegram_bot_token, {
  telegram: { webhookReply: true },
});
bot.start((ctx) => ctx.reply("Hello"));

// Koa
const app = new Koa();
app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());
app.use(async function (context, next) {
  logger.info(
    `got request body: \n${JSON.stringify(context.request.body, null, 2)}`
  );
  return next();
});
app.use(async function (context, next) {
  logger.info("forwarding request to bot");
  await bot.handleUpdate(context.request.body);
  context.status = 200;
  return next();
});
app.use(notFound);

export const handler = serverless(app);
