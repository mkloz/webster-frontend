import { z } from 'zod';

export const IdValidator = z.object({
  id: z.string().trim().min(1, { message: 'Id is required' })
});
