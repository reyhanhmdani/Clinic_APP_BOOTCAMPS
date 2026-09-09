import { LoginInput, RegisterInput } from '../validation/userSchema.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  if (!existingUser) {
    throw new ApiError(401, 'email atau password salah');
  }

  // jika akun daftar via google dan belum punya password lokal
  if (!existingUser.password) {
    throw new ApiError(400, 'Akun ini terdaftar via Google. Silakan klik tombol "Login with Google".');
  }
  if (!(await bcrypt.compare(password, existingUser.password))) {
    throw new ApiError(401, 'Email atau password salah');
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

export const verifyGoogleToken = async (credential: string) => {
  if (!credential) {
    throw new ApiError(400, 'Google token wajib disertakan');
  }

  let payload: { email: string; name?: string; sub: string; email_verified?: boolean };
  try {
    const isIdToken = credential.split('.').length === 3;

    if (isIdToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const p = ticket.getPayload();
      if (!p || !p.email) throw new Error('Payload Google ID Token tidak lengkap');
      payload = { email: p.email, name: p.name, sub: p.sub, email_verified: p.email_verified };
    } else {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${credential}` },
      });
      if (!res.ok) throw new Error(`Fetch userinfo Google gagal: ${res.status}`);
      const p = (await res.json()) as any;
      if (!p || !p.email) throw new Error('Payload Google Userinfo tidak lengkap');
      payload = { email: p.email, name: p.name, sub: p.sub, email_verified: p.email_verified };
    }
  } catch (error: any) {
    console.error('[GoogleAuth Error]:', error.message || error);
    throw new ApiError(401, 'Token Google tidak valid atau sudah kedaluwarsa');
  }

  if (!payload || !payload.email) {
    throw new ApiError(400, 'Data profil Google tidak memiliki email valid');
  }

  if (payload.email_verified === false) {
    throw new ApiError(403, 'Email Google Anda belum terverifikasi');
  }

  return {
    email: payload.email.toLowerCase().trim(),
    name: payload.name,
    googleId: payload.sub,
  };
};

export const googleAuthService = async (credential: string) => {
  const { email, name, googleId } = await verifyGoogleToken(credential);

  // 2. Cek apakah user sudah ada di database (by email atau googleId)
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
  });

  if (user) {
    // Proteksi: jika user sudah terikat dengan akun Google lain
    if (user.googleId && user.googleId !== googleId) {
      throw new ApiError(409, 'Email ini sudah terhubung dengan akun Google yang berbeda');
    }

    // KASUS AUTO-LINKING: Jika akun lama belum punya googleId, tautkan sekarang
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          provider: user.password ? 'LOCAL' : 'GOOGLE',
        },
      });
    }
  } else {
    // KASUS USER BARU: Daftarkan akun baru
    user = await prisma.user.create({
      data: {
        username: name || email.split('@')[0],
        email,
        password: null,
        role: 'CUSTOMER',
        googleId,
        provider: 'GOOGLE',
      },
    });
  }

  // 3. Terbitkan JWT Token Klinik
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || ('24h' as any) },
  );

  const { password: _, ...userWithoutPassword } = user;
  return {
    token,
    user: userWithoutPassword,
  };
};

export const linkGoogleService = async (userId: number, credential: string) => {
  const { email, googleId } = await verifyGoogleToken(credential);

  // 1. Cek user saat ini
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new ApiError(404, 'User tidak ditemukan');
  }

  // 2. Cek jika akun saat ini memang sudah terhubung dengan Google yang sama
  if (currentUser.googleId === googleId) {
    const { password: _, ...userWithoutPassword } = currentUser;
    return {
      message: 'Akun Anda sudah tertaut dengan Google ini',
      user: userWithoutPassword,
    };
  }

  // 3. Cek apakah googleId ATAU email Google ini sudah dipakai oleh akun pasien LAIN
  const existingAccount = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
  });

  if (existingAccount && existingAccount.id !== userId) {
    throw new ApiError(409, 'Akun Google ini sudah terhubung ke akun pasien lain');
  }

  // 4. Update dan tautkan googleId
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      googleId,
      provider: currentUser.password ? 'LOCAL' : 'GOOGLE',
    },
  });

  const { password: _, ...userWithoutPassword } = updatedUser;
  return {
    message: 'Berhasil menautkan akun Google!',
    user: userWithoutPassword,
  };
};
