// Data - Advanced Product Repository Implementation
import { AdvancedProduct, CreateAdvancedProduct } from '../../domain/entities/advanced-product.entity';
import { IAdvancedProductRepository } from '../../domain/repositories/advanced-product.repository.interface';
import { advancedProductApi } from '../api/advanced-product.api';
import { AdvancedProductMapper } from '../mappers/advanced-product.mapper';

export class AdvancedProductRepository implements IAdvancedProductRepository {
  async getAll(docNumber?: number): Promise<AdvancedProduct[]> {
    const dtos = await advancedProductApi.getAll(docNumber);
    return AdvancedProductMapper.toDomainList(dtos);
  }

  async getById(id: number): Promise<AdvancedProduct> {
    const dto = await advancedProductApi.getById(id);
    return AdvancedProductMapper.toDomain(dto);
  }

  async getByDocNumber(docNumber: number): Promise<AdvancedProduct> {
    const dto = await advancedProductApi.getByDocNumber(docNumber);
    return AdvancedProductMapper.toDomain(dto);
  }

  async getByProductionOrderId(productionOrderId: number): Promise<AdvancedProduct[]> {
    const dtos = await advancedProductApi.getByProductionOrderId(productionOrderId);
    return AdvancedProductMapper.toDomainList(dtos);
  }

  async getByConsumer(consumerDocEntry: number): Promise<AdvancedProduct[]> {
    const dtos = await advancedProductApi.getByConsumer(consumerDocEntry);
    return AdvancedProductMapper.toDomainList(dtos);
  }

  async getByOT(ot: string): Promise<AdvancedProduct[]> {
    const dtos = await advancedProductApi.getByOT(ot);
    return AdvancedProductMapper.toDomainList(dtos);
  }

  async getByDateRange(fromDate: string, toDate: string): Promise<AdvancedProduct[]> {
    const dtos = await advancedProductApi.getByDateRange(fromDate, toDate);
    return AdvancedProductMapper.toDomainList(dtos);
  }

  async create(product: CreateAdvancedProduct): Promise<AdvancedProduct> {
    const dto = AdvancedProductMapper.toDto(product);
    const result = await advancedProductApi.create(dto);
    return AdvancedProductMapper.toDomain(result);
  }

  async update(id: number, product: CreateAdvancedProduct): Promise<AdvancedProduct> {
    const dto = AdvancedProductMapper.toDto(product);
    const result = await advancedProductApi.update(id, dto);
    return AdvancedProductMapper.toDomain(result);
  }

  async delete(id: number): Promise<boolean> {
    return await advancedProductApi.delete(id);
  }
}

export const advancedProductRepository = new AdvancedProductRepository();
