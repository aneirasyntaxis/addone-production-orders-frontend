// Data - Profit Center API
import { apiClient } from './api-client';
import { ProfitCenterDto, ApiResponse } from '../dtos/profit-center.dto';

export class ProfitCenterApi {
  async getActive(): Promise<ProfitCenterDto[]> {
    const response = await apiClient.get<ApiResponse<ProfitCenterDto[]>>('/profit-centers');
    
    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los centros de beneficio');
    }

    return response.data;
  }
}

export const profitCenterApi = new ProfitCenterApi();
