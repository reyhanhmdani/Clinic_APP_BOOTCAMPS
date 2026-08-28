import { z } from 'zod';
import { toTitleCase } from '../utils/formatter.js';

// cara lama
// export interface LoginInput {
//   email: string;
//   password: string;
// }

export const loginSchema = z.object({
  email: z.email('format tidak valid'),
  password: z.string().min(1, 'password ga boleh kosong'),
});

// typescript otomatis mengambil tipe data dari login schema
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(1, 'Username ga boleh kosong').transform(toTitleCase),
  email: z.email('format tidak valid').min(1, 'Email ga boleh kosong'),
  password: z.string().min(1, 'Password ga boleh kosong'),
});
export type RegisterInput = z.infer<typeof registerSchema>;
