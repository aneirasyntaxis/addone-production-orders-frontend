// Data - Production Order Repository Implementation
import { ProductionOrder, CreateProductionOrder } from '../../domain/entities/production-order.entity';
import { IProductionOrderRepository } from '../../domain/repositories/production-order.repository.interface';
import { productionOrderApi } from '../api/production-order.api';
import { ProductionOrderMapper } from '../mappers/production-order.mapper';

export class ProductionOrderRepository implements IProductionOrderRepository {
  async getAll(): Promise<ProductionOrder[]> {
    const dtos = await productionOrderApi.getAll();
    return ProductionOrderMapper.toDomainList(dtos);
  }

  async getById(id: number): Promise<ProductionOrder> {
    const dto = await productionOrderApi.getById(id);
    return ProductionOrderMapper.toDomain(dto);
  }

  async getByDocNumber(docNumber: number): Promise<ProductionOrder> {
    const dto = await productionOrderApi.getByDocNumber(docNumber);
    return ProductionOrderMapper.toDomain(dto);
  }

  async getByStatus(status: string): Promise<ProductionOrder[]> {
    const dtos = await productionOrderApi.getByStatus(status);
    return ProductionOrderMapper.toDomainList(dtos);
  }

  async getByOT(ot: string): Promise<ProductionOrder[]> {
    const dtos = await productionOrderApi.getByOT(ot);
    return ProductionOrderMapper.toDomainList(dtos);
  }

  async create(order: CreateProductionOrder): Promise<ProductionOrder> {
    const dto = ProductionOrderMapper.toDto(order);
    const result = await productionOrderApi.create(dto);
    return ProductionOrderMapper.toDomain(result);
  }

  async update(id: number, order: CreateProductionOrder): Promise<ProductionOrder> {
    const dto = ProductionOrderMapper.toDto(order);
    const result = await productionOrderApi.update(id, dto);
    return ProductionOrderMapper.toDomain(result);
  }

  async delete(id: number): Promise<boolean> {
    return await productionOrderApi.delete(id);
  }
}

export const productionOrderRepository = new ProductionOrderRepository();
