import { Context, Next } from "koa";

export async function notFound(context: Context, next: Next) {
  await next();

  if (context.status) {
    return;
  }

  context.type = "json";
  context.body = {
    message: "Page Not Found",
  };
}
