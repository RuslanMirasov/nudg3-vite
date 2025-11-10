import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkspaceContext } from '@/features/workspace/providers/WorkspaceContext';
import { companyApi } from '@/features/workspace/api/workspace-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Workspace } from '@/features/workspace/types/workspace';

const SELECTED_WORKSPACE_KEY = 'nudg3_selected_workspace_id';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<Workspace | null>(null);

  const {
    data: workspaces = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => companyApi.getWorkspaces({ include_inactive: false }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const setSelectedWorkspace = useCallback(
    (workspace: Workspace | null) => {
      setSelectedWorkspaceState(workspace);
      if (workspace) {
        localStorage.setItem(SELECTED_WORKSPACE_KEY, workspace.id);
      } else {
        localStorage.removeItem(SELECTED_WORKSPACE_KEY);
      }
      queryClient.setQueryData(['selectedWorkspace'], workspace);
    },
    [queryClient]
  );

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    if (!workspaces.length) return;
    const savedId = localStorage.getItem(SELECTED_WORKSPACE_KEY);
    if (savedId) {
      const found = workspaces.find(w => w.id === savedId) ?? null;
      if (found) {
        setSelectedWorkspace(found);
      } else {
        setSelectedWorkspace(workspaces[0] ?? null);
      }
    } else if (!selectedWorkspace) {
      setSelectedWorkspace(workspaces[0] ?? null);
    }
  }, [isAuthenticated, isLoading, workspaces, selectedWorkspace, setSelectedWorkspace]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedWorkspaceState(null);
      queryClient.removeQueries({ queryKey: ['workspaces'] });
    }
  }, [isAuthenticated, queryClient]);

  const refreshWorkspaces = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,
        isLoading,
        error: error instanceof Error ? error.message : null,
        setSelectedWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
