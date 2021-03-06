import { z } from 'zod';
import {logger} from '../logger';
import { stringToNumber } from '../utils';

export const submissionSchema = z.object({
  wordleNumber: stringToNumber,
  numGuesses: z.string(),
  guesses: z.string(),
  hardMode: z.boolean(),
});
export type Submission = z.infer<typeof submissionSchema>;

export const WORDLE_SHARE_PATTERN =
  /Wordle\s(?<wordleNumber>\d+)\s(?<numGuesses>[1-6X])\/6(?<hardMode>\*?)\s+(?<guesses>(?:(?:\u{1F7E9}|\u{1F7E8}|\u{2B1C}|\u{2B1B}){5}\s?){1,6})$/u;

export function parse(text: string): Submission | null {
  const sanitizedText = text.replace(/\u{FE0F}/gu, '');

  const match = sanitizedText.match(WORDLE_SHARE_PATTERN);
  if (!match?.groups) {
    return null;
  }

  logger.debug(`matches: ${JSON.stringify(match.groups, null, 2)}`);

  return submissionSchema.parse({
    ...match.groups,
    hardMode: (match.groups.hardMode === '*'),
  });
}
