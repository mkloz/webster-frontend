import { apiClient } from '@/shared/api/api';
import type { EmailDto } from '@/shared/types/interfaces';

import type { User } from '../../user/interfaces/user.interface';
import type { LoginDto, RegisterDto, ResetPasswordDto, Success } from '../interfaces/auth.interface';
import type { Tokens } from '../stores/tokens.store';

export class AuthService {
  static async login(dto: LoginDto): Promise<Tokens> {
    return await apiClient
      .post<Tokens>('auth/login', {
        json: dto
      })
      .json();
  }

  static async googleLogin(code: string): Promise<Tokens> {
    return await apiClient
      .post<Tokens>('auth/google/login', {
        json: { code }
      })
      .json();
  }

  static async register(dto: RegisterDto): Promise<User> {
    return apiClient
      .post<User>('auth/register', {
        json: dto
      })
      .json();
  }

  static async activate(token: string) {
    return apiClient.post<Success>(`auth/activate/${token}`).json();
  }

  static async logout(token: string) {
    return await apiClient
      .post<Success>('auth/logout', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .json();
  }

  static async sendResetPasswordLink(dto: EmailDto) {
    return apiClient
      .post<Success>('auth/send-reset-password-link', {
        json: dto
      })
      .json();
  }

  static async resetPassword(dto: ResetPasswordDto) {
    return apiClient
      .post<Success>('auth/reset-password', {
        json: dto
      })
      .json();
  }
}
