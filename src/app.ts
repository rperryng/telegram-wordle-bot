import Koa, { Context, Next } from "koa";
import koaLogger from "koa-logger";
import serverless from "serverless-http";
import { logger } from "./logger";
import { notFound } from "./middlewares/not-found";

logger.info("hello world");

const app = new Koa();

app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(notFound);

export const handler = serverless(app);
