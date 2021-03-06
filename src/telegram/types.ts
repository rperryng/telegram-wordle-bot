import { z } from 'zod';
import { numberToString } from '../utils';

export const fromSchema = z.object({
  id: numberToString,
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.optional(z.string()),
  username: z.optional(z.string()),
  language_code: z.optional(z.string()),
});

export const privateMessageSchema = z.object({
  message_id: z.number(),
  from: fromSchema,
  chat: z.object({
    id: numberToString,
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
    id: numberToString,
    title: z.string(),
    type: z.literal('group'),
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

export const groupGetChatSchema = z.object({
  type: z.literal('group'),
  title: z.string(),
});
