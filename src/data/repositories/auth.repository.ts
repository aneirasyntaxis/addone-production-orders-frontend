// Data - Auth Repository Implementation
import { AuthSession } from '../../domain/entities/user.entity';
import { IAuthRepository, LoginCredentials } from '../../domain/repositories/auth.repository.interface';
import { authApi } from '../api/auth.api';
import { AuthMapper } from '../mappers/auth.mapper';
import { storageService } from '../storage/storage.service';
import { STORAGE_KEYS } from '../../core/constants/app.constants';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const dto = await authApi.login({
      username: credentials.username,
      password: credentials.password,
      companyDB: credentials.companyDB,
    });

    return AuthMapper.toDomain(dto);
  }

  async saveSession(session: AuthSession): Promise<void> {
    await storageService.setItem(STORAGE_KEYS.USER_DATA, session);
  }

  async getSession(): Promise<AuthSession | null> {
    return await storageService.getItem<AuthSession>(STORAGE_KEYS.USER_DATA);
  }

  async clearSession(): Promise<void> {
    await storageService.removeItem(STORAGE_KEYS.USER_DATA);
  }
}

export const authRepository = new AuthRepository();
