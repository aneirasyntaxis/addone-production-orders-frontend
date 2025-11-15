// Domain - Product Tree Repository Interface
import { ProductTree } from '../entities/product-tree.entity';

export interface IProductTreeRepository {
  searchByTreeCode(treeCodePart: string): Promise<ProductTree[]>;
  getByTreeCode(treeCode: string): Promise<ProductTree | null>;
}
