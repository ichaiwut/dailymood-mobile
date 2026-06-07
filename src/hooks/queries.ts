/**
 * Shared TanStack Query hooks. Query keys live here so cache invalidation stays
 * consistent across screens.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchMoods } from '../api/moods';
import { fetchProfile } from '../api/profile';

export const queryKeys = {
  moods: ['moods'] as const,
  profile: ['profile'] as const,
};

export function useMoods() {
  return useQuery({
    queryKey: queryKeys.moods,
    queryFn: fetchMoods,
    staleTime: 5 * 60_000, // moods rarely change
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
  });
}
