import { useQuery } from '@tanstack/react-query';
import { itemApi } from '../../data/api/item.api';
import { logger } from '../../core/logging/logger';

export const useItemByCode = (itemCode: string | null) => {
  return useQuery({
    queryKey: ['item', itemCode],
    queryFn: async () => {
      if (!itemCode) {
        throw new Error('Item code is required');
      }
      
      logger.debug('useItemByCode: Fetching item', { itemCode });
      const item = await itemApi.getByItemCode(itemCode);
      logger.debug('useItemByCode: Item fetched successfully', { 
        itemCode: item.itemCode,
        manageBatchNumbers: item.manageBatchNumbers 
      });
      
      return item;
    },
    enabled: !!itemCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
