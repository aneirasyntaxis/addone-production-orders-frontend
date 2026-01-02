// Domain - Get All Advanced Products Use Case
import { AdvancedProduct } from '../entities/advanced-product.entity';
import { IAdvancedProductRepository } from '../repositories/advanced-product.repository.interface';

export class GetAllAdvancedProductsUseCase {
  constructor(private advancedProductRepository: IAdvancedProductRepository) {}

  async execute(docNumber?: number): Promise<AdvancedProduct[]> {
    return await this.advancedProductRepository.getAll(docNumber);
  }
}
