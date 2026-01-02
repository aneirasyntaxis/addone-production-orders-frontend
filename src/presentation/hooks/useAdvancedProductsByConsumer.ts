// Presentation - Use Advanced Products By Consumer Hook
import { useQuery } from '@tanstack/react-query';
import { advancedProductRepository } from '../../data/repositories/advanced-product.repository';
import { AdvancedProduct } from '../../domain/entities/advanced-product.entity';

export const useAdvancedProductsByConsumer = (consumerDocEntry: number) => {
  return useQuery<AdvancedProduct[]>({
    queryKey: ['advancedProducts', 'consumer', consumerDocEntry],
    queryFn: () => advancedProductRepository.getByConsumer(consumerDocEntry),
    enabled: !!consumerDocEntry,
  });
};
