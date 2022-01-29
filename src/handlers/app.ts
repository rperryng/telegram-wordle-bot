import Koa from 'koa';
import koaLogger from 'koa-logger';
import koaBodyParser from 'koa-bodyparser';
import { logger } from '../logger';

export const app = new Koa();
app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());
