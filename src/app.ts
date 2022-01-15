import Koa, { Context, Next } from "koa";
import koaLogger from "koa-logger";
import koaBodyParser from "koa-bodyparser";
import serverless from "serverless-http";
import { logger } from "./logger";
import { notFound } from "./middlewares/not-found";

const app = new Koa();

app.use(koaLogger((str, args) => logger.info(str, args)));
app.use(koaBodyParser());
app.use(async function (context, _next) {
  logger.info(
    `got request body: \n${JSON.stringify(context.request.body, null, 2)}`
  );
});
app.use(notFound);

export const handler = serverless(app);
