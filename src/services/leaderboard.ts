import { logger } from '../logger';
import { bot } from '../telegram/bot';
import { groupGetChatSchema } from '../telegram/types';
import * as models from '../models';
import { sortBy, sumBy } from 'lodash';
import { z } from 'zod';
import { removeNulls } from '../utils';
import { current as currentWordleNumber } from '../wordle/number';
import { getUsername } from '../telegram/userUtils';

const userSummarySchema = z.object({
  userId: z.string(),
  userName: z.string(),
  average: z.number(),
  averageFormatted: z.string(),
});
type UserSummary = z.infer<typeof userSummarySchema>;

export enum Timeframe {
  MONTH = 'Month',
  WEEK = 'Week',
  ALL_TIME = 'All Time',
}

export async function get(
  chatId: string,
  timeframe: Timeframe,
): Promise<string> {
  const chat = await bot.telegram.getChat(chatId);
  const { title: chatTitle } = groupGetChatSchema.parse(chat);

  logger.info(`generating leaderboard for ${chatTitle}...`);

  const userIdsForChat = await models.chatUsers.getUserIds(chatId);

  if (userIdsForChat.length === 0) {
    return 'No users have registered in this chat';
  }

  const n = wordleNumber(timeframe);
  const userSummaries = await Promise.all(
    userIdsForChat.map((userId) => getUserSummary(chatId, userId, n)),
  );
  const sortedUserSummaries = sortBy(
    removeNulls(userSummaries),
    (s) => s.average,
  );

  if (sortedUserSummaries.length === 0) {
    return 'No submissions exist for users in this chat';
  }

  return summary(chatTitle, timeframe, sortedUserSummaries);
}

function summary(
  chatTitle: string,
  timeframe: Timeframe,
  userSummaries: UserSummary[],
): string {
  const topScore = userSummaries[0].average;

  return `
${chatTitle} Wordle Leaderboard (${timeframe}):

${userSummaries
  .map((summary, index) => {
    let prefix = `${index + 1}.`;
    if (summary.average === topScore) {
      prefix += ' 👑 ';
    }

    return `${prefix} ${summary.userName} - (${summary.average} avg)`;
  })
  .join('\n')}
  `.trim();
}

async function getUserSummary(
  chatId: string,
  userId: string,
  wordleNumber: number,
): Promise<UserSummary | null> {
  const [submissions, userName] = await Promise.all([
    models.submission.scanUserIdAndWordleNumber(userId, wordleNumber),
    getUsername(chatId, userId),
  ]);

  if (submissions.length === 0) {
    return null;
  }

  const total = sumBy(submissions, (s) => s.numGuesses);
  const averageFormatted = (total / submissions.length).toFixed(2);
  const average = Number.parseFloat(averageFormatted);

  return {
    userId,
    userName,
    average,
    averageFormatted,
  };
}

export function wordleNumber(timeframe: Timeframe): number {
  const n = currentWordleNumber();
  switch (timeframe) {
    case Timeframe.ALL_TIME:
      return 0;
    case Timeframe.MONTH:
      return n - 30;
    case Timeframe.WEEK:
      return n - 7;
  }
}
