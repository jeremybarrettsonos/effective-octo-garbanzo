import { useQuery } from '@tanstack/react-query';
import { searchTitles } from '../services/justwatch';

export function useSearch(query: string, providerIds?: number[]) {
  return useQuery({
    queryKey: ['search', query, providerIds],
    queryFn: () => searchTitles(query, providerIds),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
