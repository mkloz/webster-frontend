import { z } from 'zod';

export const FormOptional = z.unknown().transform((value) => {
  return !value || value === 'undefined' ? undefined : value;
});
