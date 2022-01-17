import { logger } from '../logger';
import { client } from '../dynamodb';
import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { env } from '../env';

const config = {
  groupsTable: env('AWS_GROUPS_TABLE'),
};

const groupUserSchema = z.object({
  groupId: z.number(),
  userId: z.number(),
});
export type GroupUser = z.infer<typeof groupUserSchema>;

export async function put(groupUser: GroupUser): Promise<void> {
  groupUser = groupUserSchema.parse(groupUser);
  const params = {
    TableName: config.groupsTable,
    Item: groupUser,
  };

  try {
    await client.put(params).promise();
  } catch (error) {
    logger.error(error);
  }
}

export async function deleteItem(groupUser: GroupUser): Promise<void> {
  const params: DocumentClient.DeleteItemInput = {
    TableName: config.groupsTable,
    Key: groupUser,
  };

  try {
    await client.delete(params).promise();
  } catch (error) {
    logger.error(error);
  }
}

export async function getGroupIds(userId: number): Promise<number[]> {
  const params: DocumentClient.QueryInput = {
    TableName: config.groupsTable,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const { Items: result } = await client.query(params).promise();
  logger.info(`getGroupIds returned: ${JSON.stringify(result, null, 2)}`);

  if (result) {
    return result.map((item) => groupUserSchema.parse(item).groupId);
  } else {
    return [];
  }
}

export async function getUserIds(groupId: number): Promise<number[]> {
  const query: DocumentClient.QueryInput = {
    TableName: config.groupsTable,
    KeyConditionExpression: 'groupId = :hashKey',
    ExpressionAttributeValues: {
      ':hashKey': groupId,
    },
  };

  const { Items: result } = await client.query(query).promise();

  if (result) {
    return result.map((item) => item['userId']);
  } else {
    return [];
  }
}
