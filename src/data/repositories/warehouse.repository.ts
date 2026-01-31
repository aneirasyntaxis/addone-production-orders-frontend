// Data - Warehouse Repository Implementation
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { IWarehouseRepository, WarehouseResult } from '../../domain/repositories/warehouse.repository.interface';
import { warehouseApi } from '../api/warehouse.api';
import { WarehouseMapper } from '../mappers/warehouse.mapper';

export class WarehouseRepository implements IWarehouseRepository {
  async getAll(): Promise<WarehouseResult> {
    try {
      const dtos = await warehouseApi.getAll();
      const warehouses = WarehouseMapper.toDomainList(dtos);
      
      return {
        isSuccess: true,
        data: warehouses,
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        data: null,
        message: error?.message || 'Error al obtener los almacenes',
      };
    }
  }
}

export const warehouseRepository = new WarehouseRepository();
