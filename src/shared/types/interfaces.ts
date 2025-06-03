import { z } from 'zod';

export const EmailSchema = z.object({
  email: z.string().email().trim().min(1, { message: 'Email is required' })
});
export type EmailDto = z.infer<typeof EmailSchema>;

export type SortOrder = 'asc' | 'desc';
export type Optional<T, K extends keyof T> = Partial<Pick<T, Extract<keyof T, K>>> & Omit<T, K> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
