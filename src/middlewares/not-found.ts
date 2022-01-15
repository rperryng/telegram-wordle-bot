import { Context } from "koa";

export async function notFound(context: Context) {
  context.status = 404;

  switch (context.accepts("html", "json")) {
    case "html":
      context.type = "html";
      context.body = "<p>Page Not Found</p>";
      break;
    case "json":
      context.type = "json";
      context.body = {
        message: "Page Not Found",
      };
      break;
    default:
      context.type = "text";
      context.body = "Page Not Found";
  }
}
