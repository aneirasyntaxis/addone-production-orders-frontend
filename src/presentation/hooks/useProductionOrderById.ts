// Presentation - useProductionOrderById Hook
import { useQuery } from '@tanstack/react-query';
import { GetProductionOrderByIdUseCase } from '../../domain/usecases/get-production-order-by-id.usecase';
import { productionOrderRepository } from '../../data/repositories/production-order.repository';
import { logger } from '../../core/logging/logger';

const getProductionOrderByIdUseCase = new GetProductionOrderByIdUseCase(productionOrderRepository);

export const useProductionOrderById = (id: number) => {
  return useQuery({
    queryKey: ['production-order', id],
    queryFn: async () => {
      logger.info('useProductionOrderById: Fetching production order', { id });
      const order = await getProductionOrderByIdUseCase.execute(id);
      logger.info('useProductionOrderById: Production order fetched successfully', { id });
      return order;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
