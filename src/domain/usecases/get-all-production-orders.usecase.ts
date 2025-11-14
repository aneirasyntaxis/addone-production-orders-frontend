// Domain - Get All Production Orders Use Case
import { ProductionOrder } from '../entities/production-order.entity';
import { IProductionOrderRepository } from '../repositories/production-order.repository.interface';

export class GetAllProductionOrdersUseCase {
  constructor(private productionOrderRepository: IProductionOrderRepository) {}

  async execute(): Promise<ProductionOrder[]> {
    return await this.productionOrderRepository.getAll();
  }
}
