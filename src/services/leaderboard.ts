import { logger } from '../logger';
import { bot } from '../telegram/bot';
import { groupGetChatSchema } from '../telegram/types';
import * as models from '../models';
import * as _ from 'lodash';
import { z } from 'zod';
import { removeNulls } from '../utils';

const userSummarySchema = z.object({
  userId: z.number(),
  userName: z.string(),
  average: z.number(),
  averageFormatted: z.string(),
});
type UserSummary = z.infer<typeof userSummarySchema>;

export async function get(chatId: number): Promise<string> {
  const chat = await bot.telegram.getChat(chatId);
  const { title: chatTitle } = groupGetChatSchema.parse(chat);

  logger.info(`generating leaderboard for ${chatTitle}...`);

  const userIdsForChat = await models.chatUsers.getUserIds(chatId);

  if (userIdsForChat.length === 0) {
    return 'No users have registered in this chat';
  }

  const userSummaries = await Promise.all(userIdsForChat.map(getUserSummary));
  const sortedUserSummaries = _.sortBy(
    removeNulls(userSummaries),
    (s) => s.average,
  );

  if (sortedUserSummaries.length === 0) {
    return 'No submissions exist for users in this chat';
  }

  logger.info(`summaries: ${JSON.stringify(sortedUserSummaries, null, 2)}`);

  return summary(chatTitle, sortedUserSummaries);
}

function summary(chatTitle: string, userSummaries: UserSummary[]): string {
  const topScore = userSummaries[0].average;

  return `
${chatTitle} Wordle Leaderboard:

${userSummaries.map((summary, index) => {
  let prefix = `${index + 1}.`;
  if (summary.average === topScore) {
    prefix += ' 👑 ';
  }

  return `${prefix} ${summary.userName} - (${summary.average} avg)`;
})}
  `.trim();
}

async function getUserSummary(userId: number): Promise<UserSummary | null> {
  const submissions = await models.submission.scanUserId(userId);
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
