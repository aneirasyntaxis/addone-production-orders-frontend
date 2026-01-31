// Presentation - useUpdateProductionOrderQuantity Hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionOrderApi } from '../../data/api/production-order.api';
import { logger } from '../../core/logging/logger';

interface UpdateQuantityRequest {
  plannedQuantity: number;
  productionOrderLines: Array<{
    lineNumber: number;
    plannedQuantity?: number | null;
    additionalQuantity?: number | null;
  }>;
}

export const useUpdateProductionOrderQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateQuantityRequest }) => {
      logger.debug('useUpdateProductionOrderQuantity: Updating quantity', { id, data });
      return await productionOrderApi.updateQuantity(id, data);
    },
    onSuccess: (data, variables) => {
      logger.info('useUpdateProductionOrderQuantity: Quantity updated successfully', {
        absoluteEntry: data.absoluteEntry,
      });
      // Invalidate specific production order and list
      queryClient.invalidateQueries({ queryKey: ['production-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
    },
    onError: (error) => {
      logger.error('useUpdateProductionOrderQuantity: Error updating quantity', error);
      console.error('🔴 Update Production Order Quantity Error:', error);
    },
  });
};
