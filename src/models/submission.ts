import { env } from '../env';
import { logger } from '../logger';
import { client } from '../dynamodb';
import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const config = {
  submissionsTable: env('AWS_SUBMISSIONS_TABLE'),
};

const submissionSchema = z.object({
  userId: z.number(),
  userName: z.string(),
  wordleNumber: z.number(),
  guesses: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;

export async function put(submission: Submission): Promise<void> {
  submission = submissionSchema.parse(submission);
  const params = {
    TableName: config.submissionsTable,
    Item: {
      ...submission,
    },
  };

  try {
    await client.put(params).promise();
  } catch (error) {
    logger.error(error);
  }
}

export async function get(
  userId: number,
  wordleNumber: number,
): Promise<Submission | null> {
  const params: DocumentClient.GetItemInput = {
    TableName: config.submissionsTable,
    Key: {
      userId,
      wordleNumber,
    },
  };

  const { Item } = await client.get(params).promise();

  if (Item) {
    return submissionSchema.parse(Item);
  } else {
    logger.info(`No record found for: ${userId}, ${wordleNumber}`);
    return null;
  }
}

export async function batchGet(
  userIds: number[],
  wordleNumber: number,
): Promise<Submission[]> {
  const params: DocumentClient.BatchGetItemInput = {
    RequestItems: {
      [config.submissionsTable]: {
        Keys: userIds.map((userId) => ({
          userId,
          wordleNumber,
        })),
      },
    },
  };

  const { Responses: result } = await client.batchGet(params).promise();

  if (result) {
    const items = result[config.submissionsTable];
    return items.map((item) => submissionSchema.parse(item));
  } else {
    return [];
  }
}

export async function deleteItem(item: {
  userId: number;
  wordleNumber: number;
}): Promise<void> {
  const params: DocumentClient.DeleteItemInput = {
    TableName: config.submissionsTable,
    Key: item,
  };

  try {
    await client.delete(params).promise();
  } catch (error) {
    logger.error(error);
  }
}
