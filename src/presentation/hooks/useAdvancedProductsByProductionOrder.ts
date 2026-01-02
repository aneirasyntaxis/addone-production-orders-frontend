// Presentation - Use Advanced Products By Production Order Hook
import { useQuery } from '@tanstack/react-query';
import { advancedProductRepository } from '../../data/repositories/advanced-product.repository';
import { AdvancedProduct } from '../../domain/entities/advanced-product.entity';

export const useAdvancedProductsByProductionOrder = (productionOrderId: number) => {
  return useQuery<AdvancedProduct[]>({
    queryKey: ['advancedProducts', 'productionOrder', productionOrderId],
    queryFn: () => advancedProductRepository.getByProductionOrderId(productionOrderId),
    enabled: !!productionOrderId,
  });
};
