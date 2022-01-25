export function removeNulls<T>(arr: Array<T | null>): Array<T> {
  const output: T[] = [];
  for (const value of arr) {
    if (value !== null) {
      output.push(value);
    }
  }
  return output;
}
