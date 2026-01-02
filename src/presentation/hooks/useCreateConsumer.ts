// Presentation - useCreateConsumer Hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateConsumerUseCase } from '../../domain/usecases/create-consumer.usecase';
import { consumerRepository } from '../../data/repositories/consumer.repository';
import { CreateConsumer } from '../../domain/entities/consumer.entity';
import { logger } from '../../core/logging/logger';

const createConsumerUseCase = new CreateConsumerUseCase(consumerRepository);

export const useCreateConsumer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consumer: CreateConsumer) => {
      logger.info('Creating consumer...', { consumer });
      const result = await createConsumerUseCase.execute(consumer);
      logger.info('Consumer created successfully', {
        docEntry: result.docEntry,
      });
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch consumers
      queryClient.invalidateQueries({ queryKey: ['consumers'] });
    },
    onError: (error) => {
      logger.error('Failed to create consumer', error);
    },
  });
};
