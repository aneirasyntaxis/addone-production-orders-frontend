// Domain - Get Production Order By ID Use Case
import { IProductionOrderRepository } from '../repositories/production-order.repository.interface';
import { ProductionOrder } from '../entities/production-order.entity';

export class GetProductionOrderByIdUseCase {
  constructor(private repository: IProductionOrderRepository) {}

  async execute(id: number): Promise<ProductionOrder> {
    return await this.repository.getById(id);
  }
}
