// Presentation - useConsumers Hook
import { useQuery } from '@tanstack/react-query';
import { GetAllConsumersUseCase } from '../../domain/usecases/get-all-consumers.usecase';
import { consumerRepository } from '../../data/repositories/consumer.repository';
import { logger } from '../../core/logging/logger';

const getAllConsumersUseCase = new GetAllConsumersUseCase(consumerRepository);

export const useConsumers = (docNumber?: number) => {
  return useQuery({
    queryKey: ['consumers', docNumber],
    queryFn: async () => {
      try {
        logger.info('Fetching consumers...', { docNumber });
        const result = await getAllConsumersUseCase.execute(docNumber);
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
