// Presentation - Product Tree Hook
import { useQuery } from '@tanstack/react-query';
import { GetProductTreeUseCase } from '../../domain/usecases/get-product-tree.usecase';
import { productTreeRepository } from '../../data/repositories/product-tree.repository.impl';
import { logger } from '../../core/logging/logger';

const getProductTreeUseCase = new GetProductTreeUseCase(productTreeRepository);

export const useProductTree = (treeCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['product-tree', treeCode],
    queryFn: async () => {
      logger.debug('useProductTree: Fetching product tree', { treeCode });
      return await getProductTreeUseCase.execute(treeCode);
    },
    enabled: enabled && !!treeCode && treeCode.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
