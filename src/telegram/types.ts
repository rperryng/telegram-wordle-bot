import { z } from 'zod';

const stringToNumber = z.preprocess((val) => parseInt(String(val)), z.number());

export const fromSchema = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string(),
  language_code: z.string(),
});

export const privateMessageSchema = z.object({
  message_id: z.number(),
  from: fromSchema,
  chat: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    type: z.literal('private'),
  }),
  date: z.number(),
  text: z.string(),
});
export type PrivateMessage = z.infer<typeof privateMessageSchema>;

export const groupMessageSchema = z.object({
  message_id: z.number(),
  from: fromSchema,
  chat: z.object({
    id: z.number(),
    title: z.string(),
    type: z.literal('group'),
    all_members_are_administrators: z.boolean(),
  }),
  date: z.number(),
  text: z.string(),
});
export type GroupMessageSchema = z.infer<typeof groupMessageSchema>;

export const messageSchema = z.union([
  privateMessageSchema,
  groupMessageSchema,
]);
export type Message = z.infer<typeof messageSchema>;

export const submissionSchema = z.object({
  wordleNumber: stringToNumber,
  numGuesses: stringToNumber,
  guesses: z.string(),
});
export type Submission = z.infer<typeof submissionSchema>;
