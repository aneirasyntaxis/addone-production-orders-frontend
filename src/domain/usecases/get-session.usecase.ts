// Domain - Get Session Use Case
import { AuthSession } from '../entities/user.entity';
import { IAuthRepository } from '../repositories/auth.repository.interface';

export class GetSessionUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<AuthSession | null> {
    return await this.authRepository.getSession();
  }
}
