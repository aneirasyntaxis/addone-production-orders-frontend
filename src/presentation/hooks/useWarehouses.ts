import { useQuery } from '@tanstack/react-query';
import { warehouseRepository } from '../../data/repositories/warehouse.repository';
import { logger } from '../../core/logging/logger';

export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      logger.debug('useWarehouses: Fetching warehouses');
      const result = await warehouseRepository.getAll();
      
      if (!result.isSuccess) {
        logger.error('useWarehouses: Failed to fetch warehouses', { error: result.message });
        throw new Error(result.message || 'Failed to fetch warehouses');
      }

      logger.debug('useWarehouses: Warehouses fetched successfully', { count: result.data?.length });
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
