// Domain - Logout Use Case
import { IAuthRepository } from '../repositories/auth.repository.interface';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.clearSession();
  }
}
