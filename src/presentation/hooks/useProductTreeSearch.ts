// Presentation - Product Tree Search Hook
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productTreeRepository } from '../../data/repositories/product-tree.repository.impl';
import { ProductTree } from '../../domain/entities/product-tree.entity';
import { logger } from '../../core/logging/logger';

export const useProductTreeSearch = (searchTerm: string, maxResults: number = 10) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
