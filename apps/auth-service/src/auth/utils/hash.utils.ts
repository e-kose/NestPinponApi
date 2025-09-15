import * as bcrypt from 'bcrypt';

export async function hashingValue(value: string): Promise<string> {
  return await bcrypt.hash(value, 10);
}

export async function compareHashedValue(value: string, hashValue: string) {
  return await bcrypt.compare(value, hashValue);
}
