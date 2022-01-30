import { bot } from './bot';

export async function getUsername(
  chatId: string,
  userId: string,
): Promise<string> {
  const chatMember = await bot.telegram.getChatMember(chatId, parseInt(userId));
  const { first_name, last_name } = chatMember.user;
  return `${first_name} ${last_name ? `${last_name[0]}.` : ''}`.trim();
}

export async function getUsernames(
  chatId: string,
  userIds: string[],
): Promise<Record<string, string>> {
  const all = await Promise.all(
    userIds.map((userId) => ({
      userId,
      userName: getUsername(chatId, userId),
    })),
  );

  return all.reduce((previous, current) => {
    return {
      ...previous,
      [current.userId]: current.userName,
    };
  }, {});
}
