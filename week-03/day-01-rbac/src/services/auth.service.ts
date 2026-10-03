import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository.js";
import { prisma } from "../lib/prisma.js";
import { generateAccessToken } from "../lib/jwt.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function register(
  name: string,
  email: string,
  password: string,
) {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);

  const user = await userRepository.create({
  name,
  email,
  passwordHash,
});

const defaultRole = await prisma.role.findFirst({
  where: {
    isDefault: true,
  },
});

if (!defaultRole) {
  throw new Error("Default role is not configured");
}

await prisma.userRole.create({
  data: {
    userId: user.id,
    roleId: defaultRole.id,
  },
});

return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function login(
  email: string,
  password: string,
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive || user.deletedAt) {
    throw new Error("Account is inactive");
  }

  const passwordIsValid = await comparePassword(
    password,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken({
  userId: user.id,
  email: user.email,
  role: user.role,
  tier: user.tier,
});

return {
  accessToken,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    createdAt: user.createdAt,
  },
};
}
