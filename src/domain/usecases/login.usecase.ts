// Domain - Login Use Case
import { AuthSession } from '../entities/user.entity';
import { IAuthRepository, LoginCredentials } from '../repositories/auth.repository.interface';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await this.authRepository.login(credentials);
    await this.authRepository.saveSession(session);
    return session;
  }
}
