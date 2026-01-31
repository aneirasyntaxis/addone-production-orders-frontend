import { useQuery } from '@tanstack/react-query';
import { profitCenterRepository } from '../../data/repositories/profit-center.repository';
import { logger } from '../../core/logging/logger';

export const useProfitCenters = () => {
  return useQuery({
    queryKey: ['profitCenters'],
    queryFn: async () => {
      logger.debug('useProfitCenters: Fetching active profit centers');
      const result = await profitCenterRepository.getActive();
      
      if (!result.isSuccess) {
        logger.error('useProfitCenters: Failed to fetch profit centers', { error: result.message });
        throw new Error(result.message || 'Failed to fetch profit centers');
      }

      logger.debug('useProfitCenters: Profit centers fetched successfully', { count: result.data?.length });
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
