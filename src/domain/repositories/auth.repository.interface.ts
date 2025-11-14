// Domain - Auth Repository Interface
import { AuthSession } from '../entities/user.entity';

export interface LoginCredentials {
  username: string;
  password: string;
  companyDB: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  saveSession(session: AuthSession): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  clearSession(): Promise<void>;
}
