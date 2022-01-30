import { logger } from '../logger';
import { bot } from '../telegram/bot';
import { groupGetChatSchema } from '../telegram/types';
import * as models from '../models';
import _ from 'lodash';
import { z } from 'zod';
import { removeNulls } from '../utils';
import { current as currentWordleNumber } from '../wordle/number';

const userSummarySchema = z.object({
  userId: z.number(),
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
  chatId: number,
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
    userIdsForChat.map((id) => getUserSummary(id, n)),
  );
  const sortedUserSummaries = _.sortBy(
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
  userId: number,
  wordleNumber: number,
): Promise<UserSummary | null> {
  const submissions = await models.submission.scanUserIdAndWordleNumber(
    userId,
    wordleNumber,
  );
  if (submissions.length === 0) {
    return null;
  }

  const userName = submissions[submissions.length - 1].userName;
  const total = _.sumBy(submissions, (s) => s.numGuesses);
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
