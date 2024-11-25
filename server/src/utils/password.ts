// src/utils/password.ts
import { hash, compare } from "bcrypt";

export const hashPassword = (password: string): Promise<string> => {
  return hash(password, 10);
};

export const comparePasswords = (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return compare(password, hashedPassword);
};
