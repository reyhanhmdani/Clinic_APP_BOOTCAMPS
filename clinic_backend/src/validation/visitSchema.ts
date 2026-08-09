import { z } from 'zod';

export const createVisitSchema = z.object({});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
