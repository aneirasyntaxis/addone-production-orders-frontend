// Presentation - useLogin Hook
import { useMutation } from '@tanstack/react-query';
import { LoginUseCase } from '../../domain/usecases/login.usecase';
import { authRepository } from '../../data/repositories/auth.repository';
import { LoginCredentials } from '../../domain/repositories/auth.repository.interface';

const loginUseCase = new LoginUseCase(authRepository);

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUseCase.execute(credentials),
  });
};
