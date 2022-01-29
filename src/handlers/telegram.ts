import { app } from './app';
import { bot } from '../telegram';
import serverless from 'serverless-http';

app.use(async (context) => {
  await bot.handleUpdate(context.request.body);
  context.status = 200;
});

export const handler = serverless(app);
