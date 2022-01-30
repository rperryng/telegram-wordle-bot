import { z } from 'zod';

export const stringToNumber = z.preprocess(
  (val) => parseInt(String(val)),
  z.number(),
);

export const numberToString = z.preprocess((val) => String(val), z.string());

export function removeNulls<T>(arr: Array<T | null>): Array<T> {
  const output: T[] = [];
  for (const value of arr) {
    if (value !== null) {
      output.push(value);
    }
  }
  return output;
}
