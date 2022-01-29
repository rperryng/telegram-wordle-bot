import { receiver, bot } from '../slack/bot';
import { AwsHandler } from '@slack/bolt/dist/receivers/AwsLambdaReceiver';
import { logger } from '../logger';

bot.message('hello', async ({ message, say }) => {
  logger.info('hello invoked');
  const userName = 'ryan';

  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there <@${userName}>!`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Click Me',
          },
          action_id: 'button_click',
        },
      },
    ],
    text: `Hey there <@${userName}>!`,
  });
});

export const handler: AwsHandler = async (event, context, callback) => {
  logger.info(
    `slack handler received request:\n${JSON.stringify(event.body, null, 2)}`,
  );
  const handler = await receiver.start();
  return handler(event, context, callback);
};
