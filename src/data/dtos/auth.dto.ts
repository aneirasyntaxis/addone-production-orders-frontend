// Data - Auth DTOs
export interface UserLoginDto {
  username: string;
  password: string;
  companyDB: string;
}

export interface SapTokenInfoDto {
  sessionId: string;
  version: string;
  expiresAt: string;
  companyDB: string;
  sessionTimeoutMinutes: number;
  isActive: boolean;
}

export interface UserLoginResponseDto {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  lastLoginAt?: string;
  sapToken?: SapTokenInfoDto;
  token?: string; // JWT token
  tokenExpiresAt?: string; // ISO 8601 date string
}
