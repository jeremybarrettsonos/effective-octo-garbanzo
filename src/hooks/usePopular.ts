import { useQuery } from '@tanstack/react-query';
import { getPopular } from '../services/justwatch';

export function usePopular(providerIds?: number[]) {
  return useQuery({
    queryKey: ['popular', providerIds],
    queryFn: () => getPopular(providerIds),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
