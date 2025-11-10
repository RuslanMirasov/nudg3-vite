import { api } from '@/shared/lib/apiClient';
import type { Workspace, BrandIconResponse } from '@/features/workspace/types/workspace';

export const companyApi = {
  // GET
  getWorkspaces: (params?: { limit?: number; offset?: number; include_inactive?: boolean }) => api.get<Workspace[]>('/company/workspaces', params),
  getWorkspace: (workspaceId: string) => api.get<Workspace>(`/company/workspaces/${workspaceId}`),

  // POST
  createWorkspace: (data: { name: string; brand_name?: string; brand_domain?: string; brand_keywords?: string[] }) =>
    api.post<Workspace>('/company/workspaces', data),

  // PUT
  updateWorkspace: (
    workspaceId: string,
    data: {
      name?: string;
      brand_name?: string;
      brand_domain?: string;
      brand_keywords?: string[];
      is_active?: boolean;
      settings?: Record<string, unknown>;
    }
  ) => api.put<Workspace>(`/company/workspaces/${workspaceId}`, data),
};

export const brandLogoApi = {
  getLogoByDomain: (workspaceId: string, domain: string) => api.get<BrandIconResponse>(`/workspace/${workspaceId}/brands/logo`, { domain }),
};
