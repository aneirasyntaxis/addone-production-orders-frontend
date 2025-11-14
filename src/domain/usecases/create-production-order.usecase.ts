// Domain - Create Production Order Use Case
import { ProductionOrder, CreateProductionOrder } from '../entities/production-order.entity';
import { IProductionOrderRepository } from '../repositories/production-order.repository.interface';

export class CreateProductionOrderUseCase {
  constructor(private productionOrderRepository: IProductionOrderRepository) {}

  async execute(order: CreateProductionOrder): Promise<ProductionOrder> {
    return await this.productionOrderRepository.create(order);
  }
}
