// Data - Item API
import { apiClient } from './api-client';
import { ApiResponse } from '../dtos/company.dto';

export interface ItemDto {
  itemCode: string;
  itemName?: string;
  itemsGroupCode?: number;
  foreignName?: string;
  valid: boolean;
}

export class ItemApi {
  async getByName(name: string): Promise<ItemDto[]> {
    const response = await apiClient.get<ApiResponse<ItemDto[]>>(
      `/items/by-name/${encodeURIComponent(name)}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al buscar items');
    }

    return response.data;
  }
}

export const itemApi = new ItemApi();
