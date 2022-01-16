export function env(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`missing required env: '${key}'`);
  }

  return value;
}
