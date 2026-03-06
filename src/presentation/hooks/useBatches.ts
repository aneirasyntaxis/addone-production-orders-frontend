// Presentation - Use Batches Hook
import { useQuery } from '@tanstack/react-query';
import { batchRepository } from '../../data/repositories/batch.repository.impl';

export const useBatches = (itemCode: string, whsCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['batches', itemCode, whsCode],
    queryFn: () => batchRepository.getBatchesByItemAndWarehouse(itemCode, whsCode),
    enabled: enabled && !!itemCode && !!whsCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
