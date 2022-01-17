import { Context } from 'telegraf';
import { logger } from '../logger';
import * as models from '../models';
import { messageSchema } from './types';
import { config } from './fetch';
import { bot } from './bot';
import sortBy from 'lodash.sortby';

type Submission = models.submission.Submission & {
  numGuesses: number;
};

export async function handler(context: Context) {
  const message = messageSchema.parse(context.message);
  const chatId = message.chat.id;
  const userIdsForChat = await models.groupUsers.getUserIds(chatId);

  if (message.chat.type === 'private') {
    return context.reply('/today is not supported in private chats');
  }

  logger.info(`${message.chat.title} has userIds: ${userIdsForChat.join(',')}`);

  if (!userIdsForChat) {
    return context.reply(`No registered users found for ${message.chat.title}`);
  }

  const submissions = await models.submission.batchGet(
    userIdsForChat,
    config.wordleNumber,
  );

  if (submissions.length === 0) {
    return context.reply(
      `No one in ${message.chat.title} has submitted their scores to Wordlebot today`,
    );
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

  if (allSubmissionsPresent) {
    return bot.telegram.sendMessage(chatId, fullSummary(modifiedSubmissions));
  } else {
    return context.reply(discreetSummary(modifiedSubmissions));
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
