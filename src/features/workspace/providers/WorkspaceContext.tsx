import { createContext } from 'react';
import type { Workspace } from '@/features/workspace/types/workspace';

export interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);
