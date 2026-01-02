// Presentation - useCreateAdvancedProduct Hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateAdvancedProductUseCase } from '../../domain/usecases/create-advanced-product.usecase';
import { advancedProductRepository } from '../../data/repositories/advanced-product.repository';
import { CreateAdvancedProduct } from '../../domain/entities/advanced-product.entity';
import { logger } from '../../core/logging/logger';

const createAdvancedProductUseCase = new CreateAdvancedProductUseCase(
  advancedProductRepository
);

export const useCreateAdvancedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: CreateAdvancedProduct) => {
      logger.info('Creating advanced product...', { product });
      const result = await createAdvancedProductUseCase.execute(product);
      logger.info('Advanced product created successfully', {
        docEntry: result.docEntry,
      });
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch advanced products
      queryClient.invalidateQueries({ queryKey: ['advanced-products'] });
      queryClient.invalidateQueries({ queryKey: ['advancedProducts'] });
    },
    onError: (error) => {
      logger.error('Failed to create advanced product', error);
    },
  });
};
