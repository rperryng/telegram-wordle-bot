import { App, AwsLambdaReceiver } from '@slack/bolt';
import { env } from '../env';
import { handler as messageHandler } from './messageHandler';

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
