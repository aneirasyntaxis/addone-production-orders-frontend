// Domain - User Entity
export interface User {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  lastLoginAt?: Date;
}

export interface SapToken {
  sessionId: string;
  version: string;
  expiresAt: Date;
  companyDB: string;
  companyName?: string;
  sessionTimeoutMinutes: number;
  isActive: boolean;
}

export interface AuthSession {
  user: User;
  sapToken: SapToken;
}
