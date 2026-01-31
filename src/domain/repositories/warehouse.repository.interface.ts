// Domain - Warehouse Repository Interface
import { Warehouse } from '../entities/warehouse.entity';

export interface WarehouseResult {
  isSuccess: boolean;
  data: Warehouse[] | null;
  message?: string;
}

export interface IWarehouseRepository {
  getAll(): Promise<WarehouseResult>;
}
