import { z } from 'zod';

export const FullNameValidator = z
  .string()
  .min(1, 'Required field')
  .min(3, 'Must be at least 3 characters')
  .max(32, 'Must be at most 32 characters');
