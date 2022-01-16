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
    console.log(error);
  }
}

export async function get(
  userId: number,
  wordleNumber: number
): Promise<Submission | null> {
  const params: DocumentClient.GetItemInput = {
    TableName: config.submissionsTable,
    Key: {
      userId,
      wordleNumber,
    },
  };

  logger.info(`fetching item: ${JSON.stringify(params, null, 2)}`);
  const { Item } = await client.get(params).promise();
  logger.info(`got item: ${JSON.stringify(Item, null, 2)}`);

  if (Item) {
    return submissionSchema.parse(Item);
  } else {
    logger.info(`No record found for: ${userId}, ${wordleNumber}`);
    return null;
  }
}
