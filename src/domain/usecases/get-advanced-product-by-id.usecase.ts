// Domain - Get Advanced Product By ID Use Case
import { IAdvancedProductRepository } from '../repositories/advanced-product.repository.interface';
import { AdvancedProduct } from '../entities/advanced-product.entity';

export class GetAdvancedProductByIdUseCase {
  constructor(private repository: IAdvancedProductRepository) {}

  async execute(id: number): Promise<AdvancedProduct> {
    return await this.repository.getById(id);
  }
}
