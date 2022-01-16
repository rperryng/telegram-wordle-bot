import { z } from 'zod';

export const messageSchema = z.object({
  message_id: z.number(),
  from: z.object({
    id: z.number(),
    is_bot: z.boolean(),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    language_code: z.string(),
  }),
  chat: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
  }),
  date: z.number(),
  text: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

const stringToNumber = z.preprocess((val) => parseInt(String(val)), z.number());
export const submissionSchema = z.object({
  wordleNumber: stringToNumber,
  numGuesses: stringToNumber,
  guesses: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;
