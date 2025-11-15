// Data - Auth API
import { apiClient } from './api-client';
import { UserLoginDto, UserLoginResponseDto } from '../dtos/auth.dto';
import { ApiResponse } from '../dtos/company.dto';

export class AuthApi {
  async login(credentials: UserLoginDto): Promise<UserLoginResponseDto> {
    const response = await apiClient.post<ApiResponse<UserLoginResponseDto>>(
      '/users/login',
      credentials
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || response.errors?.[0] || 'Error al iniciar sesión');
    }

    return response.data;
  }
}

export const authApi = new AuthApi();
