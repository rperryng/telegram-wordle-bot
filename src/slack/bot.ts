import { App, AwsLambdaReceiver } from '@slack/bolt';
import { handler as messageHandler } from './messageHandler';
import { env } from '../env';

const config = {
  token: env('SLACK_BOT_TOKEN'),
  signingSecret: env('SLACK_SIGNING_SECRET'),
};

export const receiver = new AwsLambdaReceiver({
  signingSecret: config.signingSecret,
});

export const bot = new App({
  token: config.token,
  receiver,
  processBeforeResponse: true,
});

bot.message(messageHandler);
