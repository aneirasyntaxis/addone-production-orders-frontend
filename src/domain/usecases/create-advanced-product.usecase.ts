// Domain - Create Advanced Product Use Case
import { AdvancedProduct, CreateAdvancedProduct } from '../entities/advanced-product.entity';
import { IAdvancedProductRepository } from '../repositories/advanced-product.repository.interface';

export class CreateAdvancedProductUseCase {
  constructor(private advancedProductRepository: IAdvancedProductRepository) {}

  async execute(product: CreateAdvancedProduct): Promise<AdvancedProduct> {
    return await this.advancedProductRepository.create(product);
  }
}
