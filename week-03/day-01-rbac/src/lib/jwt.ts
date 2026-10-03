import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  tier: string;
}

export function generateAccessToken(
  payload: AccessTokenPayload,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
}
