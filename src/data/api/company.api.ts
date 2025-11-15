// Data - Company API
import { apiClient } from './api-client';
import { CompanyDto, ApiResponse } from '../dtos/company.dto';

export class CompanyApi {
  async getAll(): Promise<CompanyDto[]> {
    const response = await apiClient.get<ApiResponse<CompanyDto[]>>('/companies');
    
    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener las compañías');
    }

    return response.data;
  }
}

export const companyApi = new CompanyApi();
