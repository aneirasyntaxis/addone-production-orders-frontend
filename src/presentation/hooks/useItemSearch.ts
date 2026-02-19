// Presentation - Item Search Hook with Debounce
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { GetItemsByNameUseCase } from '../../domain/usecases/get-items-by-name.usecase';
import { itemRepository } from '../../data/repositories/item.repository.impl';
import { Item } from '../../domain/entities/item.entity';
import { logger } from '../../core/logging/logger';
import { SEARCH_DEBOUNCE_MS } from '../../core/config/search.config';

const getItemsByNameUseCase = new GetItemsByNameUseCase(itemRepository);

export const useItemSearch = (searchTerm: string, maxResults: number = 5) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Cancel previous queries when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      queryClient.cancelQueries({ queryKey: ['items', 'search'] });
    }
  }, [debouncedSearchTerm, queryClient]);

  const query = useQuery({
    queryKey: ['items', 'search', debouncedSearchTerm],
    queryFn: async () => {
      logger.debug('useItemSearch: Fetching items', { searchTerm: debouncedSearchTerm });
      const items = await getItemsByNameUseCase.execute(debouncedSearchTerm);
      // Limit results to maxResults
      return items.slice(0, maxResults);
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    isSearching: searchTerm.length >= 3 && (query.isLoading || query.isFetching),
  };
};
