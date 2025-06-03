export enum AuthProviderType {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE'
}

export interface User {
  id: string;
  email: string;
  password?: string; // Null if using OAuth
  name: string;
  avatar?: string;
  authProvider: AuthProviderType;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
