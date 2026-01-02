// Domain - Production Order Repository Interface
import { ProductionOrder, CreateProductionOrder } from '../entities/production-order.entity';

export interface IProductionOrderRepository {
  getAll(documentNumber?: number): Promise<ProductionOrder[]>;
  getById(id: number): Promise<ProductionOrder>;
  getByDocNumber(docNumber: number): Promise<ProductionOrder>;
  getByStatus(status: string): Promise<ProductionOrder[]>;
  getByOT(ot: string): Promise<ProductionOrder[]>;
  create(order: CreateProductionOrder): Promise<ProductionOrder>;
  update(id: number, order: CreateProductionOrder): Promise<ProductionOrder>;
  delete(id: number): Promise<boolean>;
}
