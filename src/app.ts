import Koa from 'koa';
import koaLogger from 'koa-logger';
import koaBodyParser from 'koa-bodyparser';
import serverless from 'serverless-http';
import { logger } from './logger';
import { notFound } from './middlewares/not-found';
import { bot } from './telegram';

const app = new Koa();

app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());
// app.use(logBody);
app.use(async (context) => {
  await bot.handleUpdate(context.request.body);
  context.status = 200;
});
app.use(notFound);

export const handler = serverless(app);
