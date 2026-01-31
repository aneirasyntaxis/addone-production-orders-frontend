// Data - Item API
import { apiClient } from './api-client';
import { ApiResponse } from '../dtos/company.dto';

export interface ItemWarehouseInfoDto {
  minimalStock: number;
  maximalStock: number;
  minimalOrder: number;
  warehouseCode?: string;
  inStock: number;
  committed: number;
  ordered: number;
  countedQuantity: number;
}

export interface ItemDto {
  itemCode: string;
  itemName?: string;
  itemsGroupCode?: number;
  foreignName?: string;
  valid: boolean;
  manageBatchNumbers: boolean;
  itemWarehouseInfoCollection: ItemWarehouseInfoDto[];
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

  async getByItemCode(itemCode: string): Promise<ItemDto> {
    const response = await apiClient.get<ApiResponse<ItemDto>>(
      `/items/by-item-code/${encodeURIComponent(itemCode)}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener item');
    }

    return response.data;
  }
}

export const itemApi = new ItemApi();
