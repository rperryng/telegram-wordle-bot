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
  logger.info('batchGet');
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
  logger.info('batchGetComplete');

  const response = await client.batchGet(params).promise();
  logger.info(`batchGet response: ${JSON.stringify(response, null, 2)}`);
  return [];
}
