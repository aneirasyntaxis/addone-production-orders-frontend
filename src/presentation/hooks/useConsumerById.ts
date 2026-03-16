// Presentation - useConsumerById Hook
import { useQuery } from '@tanstack/react-query';
import { GetConsumerByIdUseCase } from '../../domain/usecases/get-consumer-by-id.usecase';
import { consumerRepository } from '../../data/repositories/consumer.repository';
import { logger } from '../../core/logging/logger';

const getConsumerByIdUseCase = new GetConsumerByIdUseCase(consumerRepository);

export const useConsumerById = (id: number) => {
  return useQuery({
    queryKey: ['consumer', id],
    queryFn: async () => {
      logger.info('useConsumerById: Fetching consumer', { id });
      const consumer = await getConsumerByIdUseCase.execute(id);
      logger.info('useConsumerById: Consumer fetched successfully', { id });
      return consumer;
    },
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data to get updated prices from SQL Query
  });
};
