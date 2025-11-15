// Data - Production Order API
import { apiClient } from './api-client';
import { ProductionOrderDto, CreateProductionOrderDto } from '../dtos/production-order.dto';
import { ApiResponse } from '../dtos/company.dto';

export class ProductionOrderApi {
  async getAll(): Promise<ProductionOrderDto[]> {
    const response = await apiClient.get<ApiResponse<ProductionOrderDto[]>>(
      '/production-orders'
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener las órdenes de producción');
    }

    return response.data;
  }

  async getById(id: number): Promise<ProductionOrderDto> {
    const response = await apiClient.get<ApiResponse<ProductionOrderDto>>(
      `/production-orders/${id}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener la orden de producción');
    }

    return response.data;
  }

  async getByDocNumber(docNumber: number): Promise<ProductionOrderDto> {
    const response = await apiClient.get<ApiResponse<ProductionOrderDto>>(
      `/production-orders/by-doc-number/${docNumber}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener la orden de producción');
    }

    return response.data;
  }

  async getByStatus(status: string): Promise<ProductionOrderDto[]> {
    const response = await apiClient.get<ApiResponse<ProductionOrderDto[]>>(
      `/production-orders/by-status/${status}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener las órdenes de producción');
    }

    return response.data;
  }

  async getByOT(ot: string): Promise<ProductionOrderDto[]> {
    const response = await apiClient.get<ApiResponse<ProductionOrderDto[]>>(
      `/production-orders/by-ot/${ot}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener las órdenes de producción');
    }

    return response.data;
  }

  async create(order: CreateProductionOrderDto): Promise<ProductionOrderDto> {
    const response = await apiClient.post<ApiResponse<ProductionOrderDto>>(
      '/production-orders',
      order
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al crear la orden de producción'
      );
    }

    return response.data;
  }

  async update(id: number, order: CreateProductionOrderDto): Promise<ProductionOrderDto> {
    const response = await apiClient.put<ApiResponse<ProductionOrderDto>>(
      `/production-orders/${id}`,
      order
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al actualizar la orden de producción'
      );
    }

    return response.data;
  }

  async delete(id: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      `/production-orders/${id}`
    );

    if (!response.isSuccess) {
      throw new Error(response.message || 'Error al eliminar la orden de producción');
    }

    return true;
  }
}

export const productionOrderApi = new ProductionOrderApi();
