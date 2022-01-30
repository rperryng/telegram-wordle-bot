import { sortBy } from 'lodash';
import { bot } from '../telegram/bot';
import * as models from '../models';
import { logger } from '../logger';
import { groupGetChatSchema } from '../telegram/types';
import { current as currentWordleNumber } from '../wordle/number';
import { getUsername } from '../telegram/userUtils';

type Submission = models.submission.Submission & {
  numGuesses: string;
  userName: string;
};

export type Summary = {
  type: 'needs_setup' | 'discreet' | 'full';
  message: string;
};

export async function getSummary(chatId: string): Promise<Summary> {
  const chat = await bot.telegram.getChat(chatId);
  const wordleNumber = currentWordleNumber();
  const { title: chatTitle } = groupGetChatSchema.parse(chat);
  logger.info(`checking summary for ${chatTitle}...`);

  const userIdsForChat = await models.chatUsers.getUserIds(chatId);

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

  let modifiedSubmissions = await Promise.all(
    submissions.map(async (s) => {
      const numGuesses = s.numGuesses === 7 ? 'X' : s.numGuesses.toString();

      return {
        ...s,
        userName: await getUsername(chatId, s.userId),
        numGuesses,
      };
    }),
  );
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
  .map((submission, index) => {
    let prefix = `${index + 1}.`;
    if (submission.numGuesses === topScore) {
      prefix += ' 👑 ';
    } else if (submission.numGuesses === 'X') {
      prefix += ' 💩 ';
    }

    return `
${prefix} ${submission.userName} - ${submission.numGuesses} guesses
${type === 'full' ? submission.guesses : ''}
    `.trim();
  })
  .join('\n\n')}
`.trim();
}
