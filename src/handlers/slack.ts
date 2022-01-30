import './app';

import { AwsHandler } from '@slack/bolt/dist/receivers/AwsLambdaReceiver';
import { receiver } from '../slack/bot';
import { logger } from '../logger';

export const handler: AwsHandler = async (event, context, callback) => {
  logger.info('slack handler called');
  const _handler = await receiver.start();
  return _handler(event, context, callback);
};
