// import { useState, useEffect } from 'react';
// import { analyticsApi } from '@/features/dashboard/api/analytics-api';
// import { tokenStorage } from '@/features/auth/lib/token-storage';

// interface FilterOptions {
//   date_range: {
//     earliest_date: string;
//     latest_date: string;
//   };
//   providers: string[];
//   tags: string[];
//   brands: Array<{
//     id: string;
//     name: string;
//     domain: string;
//     is_primary_brand: boolean;
//   }>;
// }

// interface CacheEntry {
//   data: FilterOptions;
//   timestamp: number;
// }

// const CACHE_TTL = 5 * 60 * 1000;
// const cache = new Map<string, CacheEntry>();

// export function useFilterOptions(workspaceId: string | null) {
//   const [data, setData] = useState<FilterOptions | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!workspaceId) {
//       setData(null);
//       return;
//     }

//     const fetchFilterOptions = async () => {
//       try {
//         const cached = cache.get(workspaceId);
//         const now = Date.now();

//         if (cached && now - cached.timestamp < CACHE_TTL) {
//           // Use cached data
//           setData(cached.data);
//           setIsLoading(false);
//           return;
//         }

//         setIsLoading(true);
//         setError(null);

//         const token = tokenStorage.getToken();
//         if (!token) {
//           throw new Error('No authentication token found');
//         }

//         const response = await analyticsApi.getFilterOptions({ workspace_id: workspaceId });
//         const filterOptions = response?.data;

//         cache.set(workspaceId, {
//           data: filterOptions,
//           timestamp: now,
//         });

//         setData(filterOptions);
//       } catch (err) {
//         console.error('Failed to fetch filter options:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch filter options');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFilterOptions();
//   }, [workspaceId]);

//   return { data, isLoading, error };
// }

// export function clearFilterOptionsCache(workspaceId?: string) {
//   if (workspaceId) {
//     cache.delete(workspaceId);
//   } else {
//     cache.clear();
//   }
// }

// ✅ Новый оптимизированный хук для получения фильтров
// Теперь полностью управляется через TanStack React Query
// src/features/dashboard/hooks/useFilterOptions.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/features/dashboard/api/analytics-api';

export interface FilterOptions {
  date_range: {
    earliest_date: string;
    latest_date: string;
  };
  providers: string[];
  tags: string[];
  brands: Array<{
    id: string;
    name: string;
    domain: string;
    is_primary_brand: boolean;
  }>;
}

// Тип API-ответа от бэкенда
export interface FilterOptionsResponse {
  status: string;
  message: string;
  data: FilterOptions;
}

export function useFilterOptions(workspaceId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['filterOptions', workspaceId],

    queryFn: async (): Promise<FilterOptions> => {
      if (!workspaceId) throw new Error('No workspace selected');
      const response = await analyticsApi.getFilterOptions({ workspace_id: workspaceId });
      return response.data;
    },

    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,

    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['filterOptions', workspaceId] }),
  };
}
