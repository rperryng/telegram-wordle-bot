import { bot } from '../telegram/bot';
import * as models from '../models';
import { logger } from '../logger';
import { groupGetChatSchema } from '../telegram/types';
import sortBy from 'lodash.sortby';
import { current as currentWordleNumber } from '../wordle-number';

type Submission = models.submission.Submission & {
  numGuesses: number;
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

  const userIdsForChat = await models.groupUsers.getUserIds(chatId);
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

  const userIdsSubmissions = submissions.map((s) => s.userId).sort();
  userIdsForChat.sort();
  const allSubmissionsPresent = userIdsSubmissions.every(
    (submissionUserId, index) => submissionUserId === userIdsForChat[index],
  );

  let modifiedSubmissions = submissions.map((s) => ({
    ...s,
    numGuesses: s.guesses.split('\n').length,
  }));
  modifiedSubmissions = sortBy(modifiedSubmissions, (s) => s.numGuesses);

  logger.info(
    `${chatTitle} has ${userIdsForChat.length} users and ${submissions.length} submissions`,
  );

  if (allSubmissionsPresent) {
    return {
      type: 'full',
      message: fullSummary(modifiedSubmissions),
    };
  } else {
    return {
      type: 'discreet',
      message: discreetSummary(modifiedSubmissions),
    };
  }
}

function fullSummary(submissions: Submission[]): string {
  const wordleNumber = submissions[0].wordleNumber;

  return `
Wordle ${wordleNumber}

${submissions
  .map((submission, index) => {
    return `
${index === 0 ? '👑' : ''}${submission.userName} - ${
      submission.numGuesses
    } guesses
${submission.guesses}
  `.trim();
  })
  .join('\n\n')}
`.trim();
}

function discreetSummary(submissions: Submission[]): string {
  const wordleNumber = submissions[0].wordleNumber;

  return `
Wordle ${wordleNumber}

${submissions
  .map((submission, index) => {
    return `${index === 0 ? '👑' : ''}${submission.userName} - ${
      submission.numGuesses
    } guesses`.trim();
  })
  .join('\n')}
`.trim();
}
