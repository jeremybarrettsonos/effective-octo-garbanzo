import { useQuery } from '@tanstack/react-query';
import { getTitleDetails } from '../services/justwatch';

export function useTitleDetail(type: 'movie' | 'show', id: number) {
  return useQuery({
    queryKey: ['title', type, id],
    queryFn: () => getTitleDetails(type, id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
