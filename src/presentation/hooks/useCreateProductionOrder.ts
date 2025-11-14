// Presentation - useCreateProductionOrder Hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateProductionOrderUseCase } from '../../domain/usecases/create-production-order.usecase';
import { productionOrderRepository } from '../../data/repositories/production-order.repository';
import { CreateProductionOrder } from '../../domain/entities/production-order.entity';

const createProductionOrderUseCase = new CreateProductionOrderUseCase(
  productionOrderRepository
);

export const useCreateProductionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: CreateProductionOrder) => createProductionOrderUseCase.execute(order),
    onSuccess: () => {
      // Invalidate and refetch production orders
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
    },
  });
};
