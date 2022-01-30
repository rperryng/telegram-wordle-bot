import { SlackEventMiddlewareArgs } from '@slack/bolt';
import { logger } from '../logger';
import { parse } from '../wordle/pattern';
import { simpleMessageSchema } from './types';

export async function handler({
  message: rawMessage,
  say,
}: SlackEventMiddlewareArgs<'message'>) {
  logger.info('message handler called');
  logger.info(JSON.stringify(rawMessage, null, 2));

  const message = simpleMessageSchema.parse(rawMessage);
  const text = sanitizeText(message.text);
  const submission = parse(text);

  if (!submission) {
    logger.info('No wordle pattern detected');
    // do nothing
    return;
  }

  logger.info(
    `wordle pattern recognized for user ${message.user}. num guesses: ${submission.numGuesses}`,
  );
  await say(`submission recorded for <@${message.user}>`);
}

function sanitizeText(text: string) {
  return text
    .replace(/\u{FE0F}/gu, '') // remove emoji variation selectors
    .replace(/:black_large_square:/g, '⬛️')
    .replace(/:large_white_square:/g, '⬜')
    .replace(/:large_yellow_square:/g, '🟨')
    .replace(/:large_green_square:/g, '🟩');
}
