// Data - Batch API
import { apiClient } from './api-client';
import { BatchDto, ApiResponse } from '../dtos/batch.dto';

export const batchApi = {
  getBatchesByItemAndWarehouse: async (
    itemCode: string,
    whsCode: string
  ): Promise<BatchDto[]> => {
    const response = await apiClient.get<ApiResponse<BatchDto[]>>(
      `/batches?itemCode=${encodeURIComponent(itemCode)}&whsCode=${encodeURIComponent(whsCode)}`
    );
    
    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los lotes');
    }
    
    return response.data;
  },
};
