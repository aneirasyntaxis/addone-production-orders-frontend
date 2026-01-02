// Presentation - Use Consumers By Production Order Hook
import { useQuery } from '@tanstack/react-query';
import { consumerRepository } from '../../data/repositories/consumer.repository';
import { Consumer } from '../../domain/entities/consumer.entity';

export const useConsumersByProductionOrder = (productionOrderId: number) => {
  return useQuery<Consumer[]>({
    queryKey: ['consumers', 'productionOrder', productionOrderId],
    queryFn: () => consumerRepository.getByProductionOrderId(productionOrderId),
    enabled: !!productionOrderId,
  });
};
