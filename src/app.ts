import Koa, { Context, Next } from "koa";
import serverless from "serverless-http";
import { logger } from "./logger";
import { notFound } from "./middlewares/not-found";

logger.info("hello world");
const app = new Koa();

app.use(notFound);

export const handler = serverless(app);
