import './app';

import Koa from 'koa';
import koaLogger from 'koa-logger';
import koaBodyParser from 'koa-bodyparser';
import { logger } from '../logger';
import { bot } from '../telegram';
import serverless from 'serverless-http';

export const app = new Koa();
app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());

app.use(async (context) => {
  await bot.handleUpdate(context.request.body);
  context.status = 200;
});

export const handler = serverless(app);
