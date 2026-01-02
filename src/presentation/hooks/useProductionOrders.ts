// Presentation - useProductionOrders Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllProductionOrdersUseCase } from '../../domain/usecases/get-all-production-orders.usecase';
import { productionOrderRepository } from '../../data/repositories/production-order.repository';
import { logger } from '../../core/logging/logger';

const getAllProductionOrdersUseCase = new GetAllProductionOrdersUseCase(
  productionOrderRepository
);

export const useProductionOrders = (documentNumber?: number) => {
  return useQuery({
    queryKey: ['production-orders', documentNumber],
    queryFn: async () => {
      try {
        logger.info('Fetching production orders...', { documentNumber });
        const result = await getAllProductionOrdersUseCase.execute(documentNumber);
        logger.info('Production orders fetched successfully', {
          count: result.length,
        });
        return result;
      } catch (error) {
        logger.error('Failed to fetch production orders', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      logger.warn(`Query retry attempt ${failureCount}`, error);
      return failureCount < 2;
    },
  });
};
