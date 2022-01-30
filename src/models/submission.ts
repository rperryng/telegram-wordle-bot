import { env } from '../env';
import { logger } from '../logger';
import { client } from '../dynamodb';
import { z } from 'zod';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const SUCCESSFUL_GUESS_PATTERN = /\u{1F7E9}{5}/u;
const NUM_GUESSES_FOR_FAILURE = 7;

const config = {
  submissionsTable: env('AWS_SUBMISSIONS_TABLE'),
};

const submissionSchema = z.object({
  userId: z.string(),
  wordleNumber: z.number(),
  guesses: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;

const augmentedSubmissionSchema = submissionSchema.extend({
  numGuesses: z.number(),
});
export type AugmentedSubmission = z.infer<typeof augmentedSubmissionSchema>;

function map(submission: Submission): AugmentedSubmission {
  const numGuesses = SUCCESSFUL_GUESS_PATTERN.test(submission.guesses)
    ? submission.guesses.split('\n').length
    : NUM_GUESSES_FOR_FAILURE;

  return {
    ...submission,
    numGuesses,
  };
}

export async function put(submission: Submission): Promise<void> {
  submission = submissionSchema.parse(submission);
  const params = {
    TableName: config.submissionsTable,
    Item: {
      ...submission,
    },
  };

  await client.put(params).promise();
}

export async function get(
  userId: string,
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
  userIds: string[],
  wordleNumber: number,
): Promise<AugmentedSubmission[]> {
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
    return items.map((item) => map(submissionSchema.parse(item)));
  } else {
    return [];
  }
}

export async function scanUserIdAndWordleNumber(
  userId: string,
  wordleNumber: number,
): Promise<AugmentedSubmission[]> {
  const query: DocumentClient.QueryInput = {
    TableName: config.submissionsTable,
    KeyConditionExpression:
      'userId = :hashKey AND wordleNumber >= :wordleNumber',
    ExpressionAttributeValues: {
      ':hashKey': userId,
      ':wordleNumber': wordleNumber,
    },
  };

  const { Items: result } = await client.query(query).promise();

  if (result) {
    return result.map((item) => map(submissionSchema.parse(item)));
  } else {
    return [];
  }
}

export async function deleteItem(item: {
  userId: string;
  wordleNumber: number;
}): Promise<void> {
  const params: DocumentClient.DeleteItemInput = {
    TableName: config.submissionsTable,
    Key: item,
  };

  await client.delete(params).promise();
}
