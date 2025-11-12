import { api } from '@/shared/lib/apiClient';
import type {
  SourceAnalytics,
  PromptSpecificBrandAnalytics,
  ProviderResponseDetails,
  ChatResponsesListResponse,
  SuggestedPromptsBatchResponse,
  SuggestedPromptSeedsResponse,
  UpdatePromptStatusRequest,
  PromptTemplateResponse,
  WorkspaceCapacity,
  PromptTemplateListResponse,
  PromptAnalytics,
  CompetitorsListResponse,
  CompetitorResponse,
  PromptTemplateSummary,
  DashboardAnalytics,
} from '@/features/auth/types/auth';
import type {
  GetFilterOptionsParams,
  FilterOptionsResponse,
  GetDashboardParams,
  GetPromptsParams,
  GetProviderResponsesParams,
  CreatePromptTemplateParams,
  UpdatePromptTemplateParams,
  GetCompetitorsParams,
  CreateBrandParams,
  UpdateBrandParams,
  DeleteBrandParams,
  UpdateBrandStatusParams,
  UpdateOrCreatePrimaryBrandParams,
  GetPromptTemplateParams,
  DeletePromptTemplateParams,
  GetSpecificBrandAnalyticsParams,
  GetSourcesParams,
  GetURLAnalyticsParams,
  URLAnalyticsResponse,
  GetURLsDetailedAnalyticsParams,
  GetPromptSpecificURLsParams,
  PromptSpecificURLsResponse,
  GetPromptDashboardParams,
  GetPromptSpecificBrandAnalyticsParams,
  GetProviderResponseDetailsParams,
  GetChatResponsesParams,
  GenerateSuggestedPromptsParams,
  GenerateCustomCategoryPromptsRequest,
  StrategyRecommendationResponse,
  StrategyRecommendationRequest,
  GroundingStrategiesResponse,
  GenerateSuggestedCompetitorsResponse,
  SuggestedCompetitor,
  ListSuggestedPromptsParams,
} from '@/features/dashboard/types/analytics-types';

// ------------------ API ------------------

export const analyticsApi = {
  // GET REQUESTS
  getFilterOptions: (params: GetFilterOptionsParams) => api.get<FilterOptionsResponse>('/analytics/filters', params),

  getDashboard: (params: GetDashboardParams) => api.get<DashboardAnalytics>('/analytics/dashboard', params),

  getPrompts: (params: GetPromptsParams) => api.get<PromptAnalytics>('/analytics/prompts', params),

  getProviderResponses: (params: GetProviderResponsesParams) => api.get<ChatResponsesListResponse>('/analytics/provider-response', params),

  getCompetitors: (params: GetCompetitorsParams) => api.get<CompetitorsListResponse>('/analytics/competitors', params),

  getPromptTemplate: (params: GetPromptTemplateParams) =>
    api.get<PromptTemplateSummary>(`/workspace/${params.workspace_id}/prompt-templates/${params.template_id}`),

  getSpecificBrandAnalytics: (params: GetSpecificBrandAnalyticsParams) => api.get<DashboardAnalytics>(`/analytics/brand/${params.brand_id}`, params),

  getSources: (params: GetSourcesParams) => api.get<SourceAnalytics>('/analytics/sources', params),

  getURLAnalytics: (params: GetURLAnalyticsParams) => api.get<URLAnalyticsResponse>('/analytics/urls', params),

  getURLsDetailedAnalytics: (params: GetURLsDetailedAnalyticsParams) => api.get<SourceAnalytics>('/analytics/urls-detailed', params),

  getPromptSpecificURLs: (params: GetPromptSpecificURLsParams) => api.get<PromptSpecificURLsResponse>('/analytics/prompt/urls', params),

  getPromptDashboard: (params: GetPromptDashboardParams) => api.get<DashboardAnalytics>('/analytics/prompt-dashboard', params),

  getPromptSpecificBrandAnalytics: (params: GetPromptSpecificBrandAnalyticsParams) =>
    api.get<PromptSpecificBrandAnalytics>(`/analytics/prompt-brand/${params.brand_id}`, params),

  getProviderResponseDetails: (params: GetProviderResponseDetailsParams) =>
    api.get<ProviderResponseDetails>(`/analytics/provider-response/${params.provider_response_id}`, params),

  getChatResponses: (params: GetChatResponsesParams) => api.get<ChatResponsesListResponse>('/analytics/provider-response', params),

  getSuggestedPromptSeeds: (workspace_id: string, params?: { category?: string; limit?: number }) =>
    api.get<SuggestedPromptSeedsResponse>(`/workspace/${workspace_id}/suggested-prompts/seeds`, params),

  getGroundingStrategies: (workspace_id: string) => api.get<GroundingStrategiesResponse>(`/workspace/${workspace_id}/suggested-prompts/strategies`),

  getWorkspaceCapacity: (workspace_id: string) => api.get<WorkspaceCapacity>(`/workspace/${workspace_id}/suggested-prompts/capacity`),

  listSuggestedCompetitors: (workspace_id: string) => api.get<SuggestedCompetitor[]>(`/workspace/${workspace_id}/suggested-competitors`),

  listWorkspacePromptTemplates: (workspace_id: string, params?: { is_active?: boolean; limit?: number; offset?: number }) =>
    api.get<PromptTemplateListResponse>(`/workspace/${workspace_id}/prompt-templates`, params),

  listWorkspaceCompetitors: (workspace_id: string) =>
    api.get<CompetitorResponse[]>(`/workspace/${workspace_id}/competitors`, {
      params: { is_active: true, include_suggested: false },
    }),

  listSuggestedPrompts: (workspace_id: string, params?: ListSuggestedPromptsParams) =>
    api.get<PromptTemplateListResponse>(`/workspace/${workspace_id}/suggested-prompts/list`, params),

  // POST REQUESTS
  createPromptTemplate: (data: CreatePromptTemplateParams) => api.post<PromptTemplateResponse>('/analytics/prompt-template', data),

  createBrand: (data: CreateBrandParams) => api.post<CompetitorResponse>(`/analytics/brand?workspace_id=${data.workspace_id}`, data),

  generateSuggestedPrompts: (data: GenerateSuggestedPromptsParams) =>
    api.post<SuggestedPromptsBatchResponse>(`/workspace/${data.workspace_id}/suggested-prompts/generate`),

  generateCategoryPrompts: (workspace_id: string, category: string) =>
    api.post<SuggestedPromptsBatchResponse>(`/workspace/${workspace_id}/suggested-prompts/generate-category`, { category }),

  generateCustomCategoryPrompts: (workspace_id: string, request: GenerateCustomCategoryPromptsRequest) =>
    api.post<SuggestedPromptsBatchResponse>(`/workspace/${workspace_id}/suggested-prompts/generate-category`, request),

  getStrategyRecommendation: (workspace_id: string, answers: StrategyRecommendationRequest) =>
    api.post<StrategyRecommendationResponse>(`/workspace/${workspace_id}/suggested-prompts/recommend-strategy`, answers),

  generateSuggestedCompetitors: (workspace_id: string) =>
    api.post<GenerateSuggestedCompetitorsResponse>(`/workspace/${workspace_id}/suggested-competitors/generate`),

  // PUT REQUESTS
  updatePromptTemplate: (data: UpdatePromptTemplateParams) => api.put<PromptTemplateResponse>(`/analytics/prompt-template/${data.prompt_id}`, data),

  updateBrand: (data: UpdateBrandParams) => api.put<CompetitorResponse>(`/analytics/brand/${data.brand_id}?workspace_id=${data.workspace_id}`, data),

  updateOrCreatePrimaryBrand: (data: UpdateOrCreatePrimaryBrandParams) =>
    api.put<CompetitorResponse>(`/workspace/${data.workspace_id}/primary-brand`, data),

  // PATCH REQUESTS
  updateBrandStatus: (data: UpdateBrandStatusParams) =>
    api.patch<CompetitorResponse>(`/workspace/${data.workspace_id}/brand/${data.brand_id}/status`, data),

  updatePromptStatus: (workspace_id: string, template_id: string, request: UpdatePromptStatusRequest) =>
    api.patch<PromptTemplateResponse>(`/workspace/${workspace_id}/prompt-templates/${template_id}/status`, request),

  // DELETE REQUESTS
  deleteBrand: (params: DeleteBrandParams) => api.delete<void>(`/workspace/${params.workspace_id}/competitors/${params.brand_id}`),

  deletePromptTemplate: (params: DeletePromptTemplateParams) =>
    api.delete<void>(`/workspace/${params.workspace_id}/prompt-templates/${params.template_id}`),

  clearSuggestedPrompts: (workspace_id: string) => api.delete<void>(`/workspace/${workspace_id}/suggested-prompts`),

  deleteSuggestedPrompt: (workspace_id: string, template_id: string) =>
    api.delete<void>(`/workspace/${workspace_id}/prompt-templates/${template_id}`),
};
