import { z } from 'zod';

import { EmailValidator } from '../../../shared/validators/email.validator';
import { FullNameValidator } from '../../../shared/validators/full-name.validator';
import { PasswordValidator } from '../../../shared/validators/password.validator';

export const LoginSchema = z.object({
  email: EmailValidator,
  password: PasswordValidator
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: FullNameValidator,
  email: EmailValidator,
  password: PasswordValidator
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export interface ResetPasswordDto {
  password: string;
  token: string;
}
export interface Success {
  success: boolean;
}
