// Presentation - useAdvancedProductById Hook
import { useQuery } from '@tanstack/react-query';
import { GetAdvancedProductByIdUseCase } from '../../domain/usecases/get-advanced-product-by-id.usecase';
import { advancedProductRepository } from '../../data/repositories/advanced-product.repository';
import { logger } from '../../core/logging/logger';

const getAdvancedProductByIdUseCase = new GetAdvancedProductByIdUseCase(advancedProductRepository);

export const useAdvancedProductById = (id: number) => {
  return useQuery({
    queryKey: ['advanced-product', id],
    queryFn: async () => {
      logger.info('useAdvancedProductById: Fetching advanced product', { id });
      const product = await getAdvancedProductByIdUseCase.execute(id);
      logger.info('useAdvancedProductById: Advanced product fetched successfully', { id });
      return product;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
