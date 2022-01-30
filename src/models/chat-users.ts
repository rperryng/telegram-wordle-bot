import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { logger } from '../logger';
import { client } from '../dynamodb';
import { env } from '../env';

const config = {
  chatsTable: env('AWS_CHATS_TABLE'),
};

const chatUserSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
});
export type ChatUser = z.infer<typeof chatUserSchema>;

export async function put(chatUser: ChatUser): Promise<void> {
  chatUser = chatUserSchema.parse(chatUser);
  const params = {
    TableName: config.chatsTable,
    Item: chatUser,
  };

  await client.put(params).promise();
}

export async function deleteItem(chatUser: ChatUser): Promise<void> {
  const params: DocumentClient.DeleteItemInput = {
    TableName: config.chatsTable,
    Key: chatUser,
  };

  await client.delete(params).promise();
}

export async function getChatIds(userId: string): Promise<string[]> {
  const params: DocumentClient.QueryInput = {
    TableName: config.chatsTable,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const { Items: result } = await client.query(params).promise();
  logger.info(`getChatIds returned: ${JSON.stringify(result, null, 2)}`);

  if (result) {
    return result.map((item) => chatUserSchema.parse(item).chatId);
  } else {
    return [];
  }
}

export async function getUserIds(chatId: string): Promise<string[]> {
  const query: DocumentClient.QueryInput = {
    TableName: config.chatsTable,
    KeyConditionExpression: 'chatId = :hashKey',
    ExpressionAttributeValues: {
      ':hashKey': chatId,
    },
  };

  const { Items: result } = await client.query(query).promise();

  if (result) {
    return result.map((item) => item['userId']);
  } else {
    return [];
  }
}
