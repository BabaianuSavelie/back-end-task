import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

// TODO(roman): implement these
// external libraries can be used
// you can even ignore them and use your own preferred method

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}

export function generateToken(data: TokenData): string {
  const tokenKey = process.env.TOKEN_KEY!;
  const tokenExpire = process.env.TOKEN_EXPIRE;

  const token = jwt.sign(data, tokenKey, { expiresIn: tokenExpire });
  return token;
}

export function isValidToken(token: string): boolean {
  const tokenKey: string = process.env.TOKEN_KEY!;
  return jwt.verify(token, tokenKey) != null ? true : false;
}

// NOTE(roman): assuming that `isValidToken` will be called before
export function extraDataFromToken(token: string): TokenData {
  const tokenKey: string = process.env.TOKEN_KEY!;
  const isValid: boolean = isValidToken(token);

  if (!isValid) throw new Error("Invalid Token");

  return jwt.verify(token, tokenKey) as TokenData;
}

export interface TokenData {
  id: number;
}
