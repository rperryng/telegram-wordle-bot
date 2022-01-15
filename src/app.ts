import Koa, {Context} from 'koa';
import serverless from 'serverless-http';

const app = new Koa();

// 404
app.use(async (context: Context) => {
  context.status = 404;

  switch (context.accepts('html', 'json')) {
    case 'html':
      context.type = 'html';
      context.body = '<p>Page Not Found</p>';
      break;
    case 'json':
      context.type = 'json'
      context.body = {
        message: 'Page Not Found'
      };
      break;
    default:
      context.type = 'text';
      context.body = 'Page Not Found';
  }
});

module.exports.handler = serverless(app);
