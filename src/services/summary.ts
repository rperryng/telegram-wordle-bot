import { bot } from '../telegram/bot';
import * as models from '../models';
import { logger } from '../logger';
import { groupGetChatSchema } from '../telegram/types';
import sortBy from 'lodash.sortby';
import { current as currentWordleNumber } from '../wordle-number';

const SUCCESSFUL_GUESS_PATTERN = /\u{1F7E9}{5}/u;

type Submission = models.submission.Submission & {
  numGuesses: string;
};

export type Summary = {
  type: 'needs_setup' | 'discreet' | 'full';
  message: string;
};

export async function getSummary(chatId: number): Promise<Summary> {
  const chat = await bot.telegram.getChat(chatId);
  const wordleNumber = currentWordleNumber();
  const { title: chatTitle } = groupGetChatSchema.parse(chat);
  logger.info(`checking summary for ${chatTitle}...`);

  const userIdsForChat = await models.chatUsers.getUserIds(chatId);
  logger.info(`${chatTitle} has userIds: ${userIdsForChat.join('\n')}`);

  if (userIdsForChat.length === 0) {
    return {
      type: 'needs_setup',
      message: `No one in ${chatTitle} has registered with Wordle Bot`,
    };
  }

  const submissions = await models.submission.batchGet(
    userIdsForChat,
    wordleNumber,
  );

  if (submissions.length === 0) {
    return {
      type: 'needs_setup',
      message: `${chatTitle} has no submissions for Wordle ${wordleNumber}`,
    };
  }

  let modifiedSubmissions = submissions.map((s) => {
    const numGuesses = SUCCESSFUL_GUESS_PATTERN.test(s.guesses)
      ? s.guesses.length.toString()
      : 'X';

    return {
      ...s,
      numGuesses,
    };
  });
  modifiedSubmissions = sortBy(modifiedSubmissions, (s) => s.numGuesses);

  const type =
    submissions.length === userIdsForChat.length ? 'full' : 'discreet';
  return {
    type,
    message: summary(modifiedSubmissions, type),
  };
}

function summary(submissions: Submission[], type: 'full' | 'discreet'): string {
  const wordleNumber = submissions[0].wordleNumber;
  const topScore = submissions[0].numGuesses.toString();

  return `
Wordle ${wordleNumber}

${submissions
  .map((submission) =>
    `
${submission.numGuesses === topScore ? '👑' : ''}${submission.userName} - ${
      submission.numGuesses
    } guesses
${type === 'full' ? submission.guesses : ''}
    `.trim(),
  )
  .join('\n\n')}
`.trim();
}
