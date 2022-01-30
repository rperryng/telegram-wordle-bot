import { z } from 'zod';

export const simpleMessageSchema = z.object({
  type: z.string(),
  text: z.string(),
  user: z.string(),
  ts: z.string(),
});
export type SimpleMessage = z.infer<typeof simpleMessageSchema>;
