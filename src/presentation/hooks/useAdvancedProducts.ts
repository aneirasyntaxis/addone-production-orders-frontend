// Presentation - useAdvancedProducts Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllAdvancedProductsUseCase } from '../../domain/usecases/get-all-advanced-products.usecase';
import { advancedProductRepository } from '../../data/repositories/advanced-product.repository';
import { logger } from '../../core/logging/logger';

const getAllAdvancedProductsUseCase = new GetAllAdvancedProductsUseCase(
  advancedProductRepository
);

export const useAdvancedProducts = () => {
  return useQuery({
    queryKey: ['advanced-products'],
    queryFn: async () => {
      try {
        logger.info('Fetching advanced products...');
        const result = await getAllAdvancedProductsUseCase.execute();
        logger.info('Advanced products fetched successfully', {
          count: result.length,
        });
        return result;
      } catch (error) {
        logger.error('Failed to fetch advanced products', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      logger.warn(`Advanced products query retry attempt ${failureCount}`, error);
      return failureCount < 2;
    },
  });
};
