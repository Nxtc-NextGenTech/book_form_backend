import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const hashValue = async (value: string): Promise<string> => {
  return bcrypt.hash(value, ROUNDS);
};

export const compareValue = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
