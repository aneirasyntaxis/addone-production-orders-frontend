// Data - Consumer API
import { apiClient } from './api-client';
import { ConsumerDto, CreateConsumerDto } from '../dtos/consumer.dto';
import { ApiResponse } from '../dtos/company.dto';

export class ConsumerApi {
  async getAll(docNumber?: number): Promise<ConsumerDto[]> {
    const params = docNumber ? `?docNumber=${docNumber}` : '';
    const response = await apiClient.get<ApiResponse<ConsumerDto[]>>(`/consumers${params}`);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los consumos');
    }

    return response.data;
  }

  async getById(id: number): Promise<ConsumerDto> {
    const response = await apiClient.get<ApiResponse<ConsumerDto>>(`/consumers/${id}`);

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener el consumo');
    }

    return response.data;
  }

  async getByDocNumber(docNumber: number): Promise<ConsumerDto> {
    const response = await apiClient.get<ApiResponse<ConsumerDto>>(
      `/consumers/by-doc-number/${docNumber}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener el consumo');
    }

    return response.data;
  }

  async getByProductionOrderId(productionOrderId: number): Promise<ConsumerDto[]> {
    const response = await apiClient.get<ApiResponse<ConsumerDto[]>>(
      `/consumers/by-of/${productionOrderId}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los consumos de la orden de fabricación');
    }

    return response.data;
  }

  async getByOT(ot: string): Promise<ConsumerDto[]> {
    const response = await apiClient.get<ApiResponse<ConsumerDto[]>>(
      `/consumers/by-ot/${ot}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los consumos');
    }

    return response.data;
  }

  async getByDateRange(fromDate: string, toDate: string): Promise<ConsumerDto[]> {
    const response = await apiClient.get<ApiResponse<ConsumerDto[]>>(
      `/consumers/by-date-range/${fromDate}/${toDate}`
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(response.message || 'Error al obtener los consumos');
    }

    return response.data;
  }

  async create(consumer: CreateConsumerDto): Promise<ConsumerDto> {
    const response = await apiClient.post<ApiResponse<ConsumerDto>>(
      '/consumers',
      consumer
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al crear el consumo'
      );
    }

    return response.data;
  }

  async update(id: number, consumer: CreateConsumerDto): Promise<ConsumerDto> {
    const response = await apiClient.put<ApiResponse<ConsumerDto>>(
      `/consumers/${id}`,
      consumer
    );

    if (!response.isSuccess || !response.data) {
      throw new Error(
        response.message || response.errors?.[0] || 'Error al actualizar el consumo'
      );
    }

    return response.data;
  }

  async delete(id: number): Promise<boolean> {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/consumers/${id}`);

    if (!response.isSuccess) {
      throw new Error(response.message || 'Error al eliminar el consumo');
    }

    return true;
  }
}

export const consumerApi = new ConsumerApi();
