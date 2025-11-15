// Domain - Get Product Tree Use Case
import { IProductTreeRepository } from '../repositories/product-tree.repository';
import { ProductTree } from '../entities/product-tree.entity';
import { logger } from '../../core/logging/logger';

export class GetProductTreeUseCase {
  constructor(private repository: IProductTreeRepository) {}

  async execute(treeCode: string): Promise<ProductTree | null> {
    logger.debug('GetProductTreeUseCase: Executing', { treeCode });

    if (!treeCode || treeCode.trim().length === 0) {
      logger.warn('GetProductTreeUseCase: Empty tree code');
      return null;
    }

    try {
      const productTree = await this.repository.getByTreeCode(treeCode);
      
      if (!productTree) {
        logger.info('GetProductTreeUseCase: Product tree not found', { treeCode });
        return null;
      }

      logger.debug('GetProductTreeUseCase: Success', { 
        treeCode,
        linesCount: productTree.productTreeLines.length 
      });
      return productTree;
    } catch (error) {
      logger.error('GetProductTreeUseCase: Failed', { error });
      throw error;
    }
  }
}
