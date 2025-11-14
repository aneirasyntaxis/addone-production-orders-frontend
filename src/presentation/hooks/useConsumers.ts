// Presentation - useConsumers Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllConsumersUseCase } from '../../domain/usecases/get-all-consumers.usecase';
import { consumerRepository } from '../../data/repositories/consumer.repository';
import { logger } from '../../core/logging/logger';

const getAllConsumersUseCase = new GetAllConsumersUseCase(consumerRepository);

export const useConsumers = () => {
  return useQuery({
    queryKey: ['consumers'],
    queryFn: async () => {
      try {
        logger.info('Fetching consumers...');
        const result = await getAllConsumersUseCase.execute();
        logger.info('Consumers fetched successfully', {
          count: result.length,
        });
        return result;
      } catch (error) {
        logger.error('Failed to fetch consumers', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      logger.warn(`Consumers query retry attempt ${failureCount}`, error);
      return failureCount < 2;
    },
  });
};
