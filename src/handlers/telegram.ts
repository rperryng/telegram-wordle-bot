import './init';

import Koa from 'koa';
import koaLogger from 'koa-logger';
import koaBodyParser from 'koa-bodyparser';
import serverless from 'serverless-http';
import { logger } from '../logger';
import { bot } from '../telegram';

export const app = new Koa();
app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());

app.use(async (context) => {
  try {
    await bot.handleUpdate(context.request.body);
    context.status = 200;
  } catch (e) {
    if (e instanceof Error && e.message.includes('Forbidden')) {
      // Bot was banned / kicked from chat.
      context.status = 200;
      return logger.error(e);
    }

    throw e;
  }
});

export const handler = serverless(app);
