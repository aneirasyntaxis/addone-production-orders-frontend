// Data - Advanced Product API
import { apiClient } from './api-client';
import { AdvancedProductDto, CreateAdvancedProductDto } from '../dtos/advanced-product.dto';
import { ApiResponse } from '../dtos/company.dto';

export class AdvancedProductApi {
  async getAll(docNumber?: number): Promise<AdvancedProductDto[]> {
    const params = docNumber ? `?docNumber=${docNumber}` : '';
    const response = await apiClient.get<ApiResponse<AdvancedProductDto[]>>(
      `/advanced-products${params}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los avances');
    }

    return response.data;
  }

  async getById(id: number): Promise<AdvancedProductDto> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto>>(
      `/advanced-products/${id}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener el avance');
    }

    return response.data;
  }

  async getByDocNumber(docNumber: number): Promise<AdvancedProductDto> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto>>(
      `/advanced-products/by-doc-number/${docNumber}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener el avance');
    }

    return response.data;
  }

  async getByOT(ot: string): Promise<AdvancedProductDto[]> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto[]>>(
      `/advanced-products/by-ot/${ot}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los avances');
    }

    return response.data;
  }

  async getByProductionOrderId(productionOrderId: number): Promise<AdvancedProductDto[]> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto[]>>(
      `/advanced-products/by-of/${productionOrderId}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los avances de la orden de fabricación');
    }

    return response.data;
  }

  async getByConsumer(consumerDocEntry: number): Promise<AdvancedProductDto[]> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto[]>>(
      `/advanced-products/by-salida/${consumerDocEntry}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener las entradas de la salida');
    }

    return response.data;
  }

  async getByDateRange(fromDate: string, toDate: string): Promise<AdvancedProductDto[]> {
    const response = await apiClient.get<ApiResponse<AdvancedProductDto[]>>(
      `/advanced-products/by-date-range/${fromDate}/${toDate}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los avances');
    }

    return response.data;
  }

  async create(product: CreateAdvancedProductDto): Promise<AdvancedProductDto> {
    const response = await apiClient.post<ApiResponse<AdvancedProductDto>>(
      '/advanced-products',
      product
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al crear el avance'
      );
    }

    return response.data;
  }

  async update(id: number, product: CreateAdvancedProductDto): Promise<AdvancedProductDto> {
    const response = await apiClient.put<ApiResponse<AdvancedProductDto>>(
      `/advanced-products/${id}`,
      product
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al actualizar el avance'
      );
    }

    return response.data;
  }

  async delete(id: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/advanced-products/${id}`
    );

    if (!response.isSuccess) {
      throw new Error(response.message || 'Error al eliminar el avance');
    }

    return true;
  }
}

export const advancedProductApi = new AdvancedProductApi();
