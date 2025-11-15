// Presentation - useCreateProductionOrder Hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateProductionOrderUseCase } from '../../domain/usecases/create-production-order.usecase';
import { productionOrderRepository } from '../../data/repositories/production-order.repository';
import { CreateProductionOrder } from '../../domain/entities/production-order.entity';
import { logger } from '../../core/logging/logger';

const createProductionOrderUseCase = new CreateProductionOrderUseCase(
  productionOrderRepository
);

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: CreateProductionOrder) => {
      logger.debug('useCreateProductionOrder: Creating production order', { order });
      return await createProductionOrderUseCase.execute(order);
    },
    onSuccess: (data) => {
      logger.info('useCreateProductionOrder: Production order created successfully', {
        absoluteEntry: data.absoluteEntry,
      });
      // Invalidate and refetch production orders
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
    },
    onError: (error) => {
      logger.error('useCreateProductionOrder: Error creating production order', error);
      console.error('🔴 Create Production Order Error:', error);
    },
  });
};
