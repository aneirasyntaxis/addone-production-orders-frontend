// Domain - Advanced Product Repository Interface
import { AdvancedProduct, CreateAdvancedProduct } from '../entities/advanced-product.entity';

export interface IAdvancedProductRepository {
  getAll(): Promise<AdvancedProduct[]>;
  getById(id: number): Promise<AdvancedProduct>;
  getByDocNumber(docNumber: number): Promise<AdvancedProduct>;
  getByOT(ot: string): Promise<AdvancedProduct[]>;
  getByDateRange(fromDate: string, toDate: string): Promise<AdvancedProduct[]>;
  create(product: CreateAdvancedProduct): Promise<AdvancedProduct>;
  update(id: number, product: CreateAdvancedProduct): Promise<AdvancedProduct>;
  delete(id: number): Promise<boolean>;
}
