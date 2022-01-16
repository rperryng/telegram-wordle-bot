import { logger } from '../logger';
import { client } from '../dynamodb';
import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { env } from '../env';

const config = {
  userChannelsTable: env('AWS_USER_CHANNELS_TABLE'),
};

const userChannelsSchema = z.object({
  userId: z.number(),
  channels: z.array(z.number()),
});

export type UserChannels = z.infer<typeof userChannelsSchema>;

export async function put(userChannels: UserChannels): Promise<void> {
  userChannels = userChannelsSchema.parse(userChannels);
  const params = {
    TableName: config.userChannelsTable,
    Item: {
      ...userChannels,
    },
  };

  try {
    await client.put(params).promise();
  } catch (error) {
    logger.error(error);
  }
}

export async function get(userId: number): Promise<number[] | null> {
  const params: DocumentClient.GetItemInput = {
    TableName: config.userChannelsTable,
    Key: {
      userId,
    },
  };

  const { Item } = await client.get(params).promise();

  if (Item) {
    return userChannelsSchema.parse(Item).channels;
  } else {
    return null;
  }
}
