// Presentation - Project Search Hook with Debounce
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { projectRepository } from '../../data/repositories/project.repository';
import { logger } from '../../core/logging/logger';

export const useProjectSearch = (searchTerm: string, maxResults: number = 5) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect - 700ms as requested
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const query = useQuery({
    queryKey: ['projects', 'search', debouncedSearchTerm],
    queryFn: async () => {
      logger.debug('useProjectSearch: Fetching projects', { searchTerm: debouncedSearchTerm });
      const projects = await projectRepository.search(debouncedSearchTerm);
      // Limit results to maxResults
      return projects.slice(0, maxResults);
    },
    enabled: debouncedSearchTerm.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    projects: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    isSearching: searchTerm.length >= 3 && (query.isLoading || query.isFetching),
  };
};
