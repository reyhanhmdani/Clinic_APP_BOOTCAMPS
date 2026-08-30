import { LoginInput, RegisterInput } from '../validation/userSchema.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getUserService = async () => {
  const user = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      patient: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  });

  if (user.length === 0) {
    return [];
  }

  return user;
};

export const loginService = async ({ email, password }: LoginInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
    throw new ApiError(401, 'email atau password salah');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || ('24h' as any) },
  );

  const { password: _, ...userWithoutPassword } = existingUser;

  return {
    token,
    user: userWithoutPassword,
  };
};

export const registerService = async ({ username, email, password }: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'Email sudah terdaftar');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashPassword,
      role: 'CUSTOMER',
    },
  });

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' },
  );

  const { password: _, ...userWithoutPassword } = newUser;
  return {
    token,
    user: userWithoutPassword,
  };
};
