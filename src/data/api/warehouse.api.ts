// Data - Warehouse API
import { apiClient } from './api-client';
import { WarehouseDto, ApiResponse } from '../dtos/warehouse.dto';

export class WarehouseApi {
  async getAll(): Promise<WarehouseDto[]> {
    const response = await apiClient.get<ApiResponse<WarehouseDto[]>>('/warehouses');
    
    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los almacenes');
    }

    return response.data;
  }
}

export const warehouseApi = new WarehouseApi();
