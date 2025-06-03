import { z } from 'zod';

export const PasswordValidator = z
  .string()
  .min(8, 'Must be at least 8 characters')
  .max(32, 'Must be at most 32 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');
