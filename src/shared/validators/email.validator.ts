import { z } from 'zod';

export const EmailValidator = z
  .string()
  .min(1, 'Required field')
  .includes('@')
  .email({ message: 'Invalid email address' });
