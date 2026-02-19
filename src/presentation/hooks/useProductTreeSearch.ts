// Presentation - Product Tree Search Hook
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productTreeRepository } from '../../data/repositories/product-tree.repository.impl';
import { ProductTree } from '../../domain/entities/product-tree.entity';
import { logger } from '../../core/logging/logger';
import { SEARCH_DEBOUNCE_MS } from '../../core/config/search.config';

export const useProductTreeSearch = (searchTerm: string, maxResults: number = 10) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cancel previous queries when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      queryClient.cancelQueries({ queryKey: ['product-tree-search'] });
    }
  }, [debouncedSearchTerm, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['product-tree-search', debouncedSearchTerm],
    queryFn: async (): Promise<ProductTree[]> => {
      if (debouncedSearchTerm.length < 3) {
        return [];
      }

      logger.debug('useProductTreeSearch: Searching', { searchTerm: debouncedSearchTerm });
      const results = await productTreeRepository.searchByTreeCode(debouncedSearchTerm);
      return results.slice(0, maxResults);
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  return {
    productTrees: data || [],
    isSearching: isLoading,
  };
};
