import { logger } from '../logger';
import { client } from '../dynamodb';
import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { env } from '../env';

const config = {
  groupsTable: env('AWS_GROUPS_TABLE'),
};

const groupUsersSchema = z.object({
  groupId: z.number(),
  userIds: z.array(z.number()),
});

export type GroupUsers = z.infer<typeof groupUsersSchema>;

export async function put(groupUsers: GroupUsers): Promise<void> {
  groupUsers = groupUsersSchema.parse(groupUsers);
  const params = {
    TableName: config.groupsTable,
    Item: {
      ...groupUsers,
    },
  };

  try {
    await client.put(params).promise();
  } catch (error) {
    logger.error(error);
  }
}

export async function getGroupIds(userId: number): Promise<number[] | null> {
  const params: DocumentClient.GetItemInput = {
    TableName: config.groupsTable,
    Key: {
      userId,
    },
  };

  const { Item } = await client.get(params).promise();

  if (Item) {
    logger.info(`getGroupIds returned: ${JSON.stringify(Item, null, 2)}`);
    throw new Error('TODO: parse input for getGroupIds');
  } else {
    return null;
  }
}

export async function getUserIds(groupId: number): Promise<number[] | null> {
  const params: DocumentClient.BatchGetItemInput = {
    RequestItems: {
      [config.groupsTable]: {
        Keys: [
          {
            // groupId: {
            //   N: groupId,
            // }
            groupId,
          },
        ],
      },
    },
  };

  logger.info(`fetching userIds for groupId: ${groupId}`);
  const response = await client.batchGet(params).promise();
  logger.info(
    `got userIds for groupId response: ${JSON.stringify(response, null, 2)}`,
  );

  return [];
}
