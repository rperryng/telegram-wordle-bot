import { z } from 'zod';

export const fromSchema = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  language_code: z.string(),
});

export const messageSchema = z.object({
  message_id: z.number(),
  from: fromSchema,
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

const ChatTypeEnum = z.enum(['sender', 'group', 'supergruop', 'channel']);
export type ChatTypeEnum = z.infer<typeof ChatTypeEnum>;
export const chatSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: ChatTypeEnum,
  all_members_are_administrators: z.boolean(),
});
export type ChatSchema = z.infer<typeof chatSchema>;

export const commandSchema = z.object({
  message_id: z.number(),
  text: z.string(),
  date: z.number(),
  from: fromSchema,
  chat: chatSchema,
});
export type CommandSchema = z.infer<typeof commandSchema>;
