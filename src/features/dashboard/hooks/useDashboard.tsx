// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from '@tanstack/react-router';
// import type { DashboardAnalytics } from '@/features/auth/types/auth';
// import { analyticsApi } from '@/features/dashboard/api/analytics-api';
// import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';
// import { handleApiError } from '@/shared/lib/utils/api-error-handler';

// interface UseDashboardParams {
//   start_date?: string;
//   end_date?: string;
//   models?: string[] | undefined;
//   tags?: string[] | undefined;
// }

// export function useDashboard(params: UseDashboardParams = {}) {
//   const [data, setData] = useState<DashboardAnalytics | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const { selectedWorkspace } = useWorkspace();
//   const router = useRouter();
//   const abortControllerRef = useRef<AbortController | null>(null);

//   useEffect(() => {
//     if (!selectedWorkspace) {
//       setData(null);
//       setIsLoading(false);
//       return;
//     }

//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     abortControllerRef.current = new AbortController();
//     const currentController = abortControllerRef.current;

//     const loadDashboard = async () => {
//       try {
//         if (data === null) {
//           setIsLoading(true);
//         } else {
//           setIsRefreshing(true);
//         }
//         setError(null);

//         const filteredModels = params.models?.filter(m => m && m !== 'all') || [];
//         const filteredTags = params.tags?.filter(t => t) || [];

//         const analytics = await analyticsApi.getDashboard({
//           workspace_id: selectedWorkspace.id,
//           start_date: params.start_date ?? '',
//           end_date: params.end_date ?? '',
//           models: filteredModels.length > 0 ? filteredModels : undefined,
//           tags: filteredTags.length > 0 ? filteredTags : undefined,
//         });

//         if (!currentController.signal.aborted) {
//           setData(analytics);
//         }
//       } catch (err: any) {
//         if (!currentController.signal.aborted) {
//           console.error('Failed to load dashboard analytics:', err);

//           handleApiError(err, router, {
//             skipToast: err?.status === 401,
//           });

//           if (err?.status !== 401 && err?.status !== 402) {
//             setError(err.message || 'Failed to load dashboard analytics');
//           }
//         }
//       } finally {
//         if (!currentController.signal.aborted) {
//           setIsLoading(false);
//           setIsRefreshing(false);
//         }
//       }
//     };

//     loadDashboard();

//     return () => {
//       if (currentController) currentController.abort();
//     };
//   }, [selectedWorkspace, params.start_date, params.end_date, params.models, params.tags]);

//   const refresh = useCallback(() => {
//     setError(null);
//     if (data === null) {
//       setIsLoading(true);
//     } else {
//       setIsRefreshing(true);
//     }
//   }, []);

//   return {
//     data,
//     isLoading,
//     isRefreshing,
//     error,
//     refresh,
//   };
// }

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/dashboard/api/analytics-api';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';
import type { DashboardAnalytics } from '@/features/auth/types/auth';

interface UseDashboardParams {
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
}

export function useDashboard(params: UseDashboardParams = {}) {
  const { selectedWorkspace } = useWorkspace();

  const query = useQuery<DashboardAnalytics>({
    queryKey: ['dashboard', selectedWorkspace?.id, params.start_date, params.end_date, params.models, params.tags],
    queryFn: async () => {
      if (!selectedWorkspace) throw new Error('No workspace selected');

      const filteredModels = params.models?.filter(m => m && m !== 'all');
      const filteredTags = params.tags?.filter(t => t);

      const res = await analyticsApi.getDashboard({
        workspace_id: selectedWorkspace.id,
        start_date: params.start_date ?? '',
        end_date: params.end_date ?? '',
        models: filteredModels?.length ? filteredModels : undefined,
        tags: filteredTags?.length ? filteredTags : undefined,
      });

      return res;
    },
    enabled: !!selectedWorkspace,
    placeholderData: prev => prev,
    staleTime: 60 * 1000,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}
