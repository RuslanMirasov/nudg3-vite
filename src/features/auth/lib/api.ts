import type {
  LoginResponse,
  LoginRequest,
  User,
  Company,
  Agency,
  ChangePasswordRequest,
  ChangePasswordResponse,
  PasswordSetResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailResponse,
  TrialStatusResponse,
  SubscriptionPlan,
  CheckoutResponse,
  SubscriptionStatusResponse,
  UsageSummaryResponse,
  PaymentTransactionResponse,
  Workspace,
  WorkspaceCapacity,
  DashboardAnalytics,
  PromptSpecificBrandAnalytics,
  PromptAnalytics,
  CompetitorResponse,
  BrandIconResponse,
  CompetitorsListResponse,
  ProviderResponseDetails,
  ChatResponsesListResponse,
  SourceAnalytics,
  PromptTemplateResponse,
  SuccessResponse,
  SuggestedPromptSeedsResponse,
  SuggestedPromptsBatchResponse,
  PromptTemplateSummary,
  PromptTemplateListResponse,
  UpdatePromptStatusRequest,
  CompanyUser,
  CreateCompanyUserRequest,
  ExportStatistics,
  SourcesExportStatistics,
  ExportPreviewResponse,
  SourcesExportParams,
  PromptsExportStatistics,
  PromptsExportParams,
  DashboardExportRequest,
  DashboardExportStatistics,
} from '@/features/auth/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const getBaseUrl = () => API_BASE_URL;

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));

    // Backend returns detail as object with message field, or as string for some errors
    const errorMessage =
      typeof errorData.detail === 'object' && errorData.detail?.message ? errorData.detail.message : errorData.detail || 'Request failed';

    throw new ApiError(response.status, errorMessage);
  }
  return response.json();
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse<LoginResponse>(response);
  },

  async getCurrentUser(token: string): Promise<User> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<User>(response);
  },

  async changePassword(token: string, passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    return handleResponse<ChangePasswordResponse>(response);
  },

  async setInitialPassword(token: string, password: string): Promise<PasswordSetResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/set-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    return handleResponse<PasswordSetResponse>(response);
  },

  // MVP Signup & Verification
  async signup(signupData: SignupRequest): Promise<SignupResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    return handleResponse<SignupResponse>(response);
  },

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<VerifyEmailResponse>(response);
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse<{ message: string }>(response);
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new ApiError(response.status, 'Failed to request password reset');
    return response.json();
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.detail || 'Failed to reset password');
    }
    return response.json();
  },

  async setPassword(token: string, password: string): Promise<PasswordSetResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/set-password`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(response.status, error.detail || 'Failed to set password');
    }
    return response.json();
  },
};

// Subscription API
export const subscriptionApi = {
  async getPlans(token: string): Promise<SubscriptionPlan[]> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/subscription/plans`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<SubscriptionPlan[]>(response);
  },

  async createCheckout(token: string, workspaceId: string): Promise<CheckoutResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/subscription/checkout?workspace_id=${workspaceId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<CheckoutResponse>(response);
  },

  async getStatus(token: string): Promise<SubscriptionStatusResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/subscription/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<SubscriptionStatusResponse>(response);
  },

  async getUsageSummary(token: string): Promise<UsageSummaryResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/subscription/usage-summary`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<UsageSummaryResponse>(response);
  },

  async getPaymentHistory(token: string): Promise<PaymentTransactionResponse[]> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/subscription/payment-history`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<PaymentTransactionResponse[]>(response);
  },
};

// Trial API
export const trialApi = {
  async getStatus(token: string): Promise<TrialStatusResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/trial/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<TrialStatusResponse>(response);
  },
};

export const companyApi = {
  async getCompany(token: string): Promise<Company> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    await handleResponse<User>(response); // Validate user is authenticated

    // Get company details
    const companyResponse = await fetch(`${baseUrl}/company/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Company>(companyResponse);
  },

  async getAgency(token: string, agencyId: string): Promise<Agency> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/agency/${agencyId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Agency>(response);
  },

  async getWorkspaces(
    token: string,
    params?: {
      limit?: number;
      offset?: number;
      include_inactive?: boolean;
    }
  ): Promise<Workspace[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.include_inactive) queryParams.append('include_inactive', params.include_inactive.toString());

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/workspaces?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Workspace[]>(response);
  },

  async getWorkspace(token: string, workspaceId: string): Promise<Workspace> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/workspaces/${workspaceId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<Workspace>(response);
  },

  async updateWorkspace(
    token: string,
    workspaceId: string,
    updateData: {
      name?: string;
      brand_name?: string;
      brand_domain?: string;
      brand_keywords?: string[];
      provider_configs?: Record<string, Record<string, string | boolean>>;
      max_prompts?: number;
      settings?: Record<string, unknown>;
      is_active?: boolean;
      default_location_country?: string;
      default_location_city?: string;
      default_location_region?: string;
    }
  ): Promise<Workspace> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/workspaces/${workspaceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    return handleResponse<Workspace>(response);
  },

  async createWorkspace(
    token: string,
    createData: {
      name: string;
      brand_name?: string;
      brand_domain?: string;
      brand_keywords?: string[];
    }
  ): Promise<Workspace> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/workspaces`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData),
    });

    return handleResponse<Workspace>(response);
  },
};

export const analyticsApi = {
  async getFilterOptions(
    token: string,
    workspace_id: string
  ): Promise<{
    date_range: { earliest_date: string; latest_date: string };
    providers: string[];
    tags: string[];
    brands: Array<{
      id: string;
      name: string;
      domain: string;
      is_primary_brand: boolean;
    }>;
  }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/analytics/filters?workspace_id=${workspace_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<{
      data: {
        date_range: { earliest_date: string; latest_date: string };
        providers: string[];
        tags: string[];
        brands: Array<{
          id: string;
          name: string;
          domain: string;
          is_primary_brand: boolean;
        }>;
      };
    }>(response);
    return result.data;
  },

  async getDashboard(
    token: string,
    params: {
      workspace_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
    }
  ): Promise<DashboardAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/dashboard?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<DashboardAnalytics>(response);

    return result;
  },

  async getPrompts(
    token: string,
    params: {
      workspace_id: string;
      brand_id: string;
      status?: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
    }
  ): Promise<PromptAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    queryParams.append('brand_id', params.brand_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/prompts?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<PromptAnalytics>(response);

    return result;
  },

  // Prompt Template Management
  async createPromptTemplate(
    token: string,
    workspaceId: string,
    promptData: {
      template_text: string;
      location_region?: string;
      location_country?: string;
      location_city?: string;
    }
  ): Promise<SuccessResponse<PromptTemplateResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/analytics/prompts/templates?${queryParams}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptData),
    });

    return handleResponse<SuccessResponse<PromptTemplateResponse>>(response);
  },

  async updatePromptTemplate(
    token: string,
    workspaceId: string,
    templateId: string,
    updateData: {
      template_text?: string;
      status?: string;
      tags?: string[];
      location_region?: string;
      location_country?: string;
      location_city?: string;
    }
  ): Promise<SuccessResponse<PromptTemplateResponse>> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/analytics/prompts/templates/${templateId}?${queryParams}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    return handleResponse<SuccessResponse<PromptTemplateResponse>>(response);
  },

  // Competitor API Functions
  async getCompetitors(
    token: string,
    workspaceId: string,
    params: {
      page?: number;
      per_page?: number;
      discovery_status?: string;
      is_active?: boolean;
      search?: string;
      brand_search?: string;
      auto_generate?: boolean;
    } = {}
  ): Promise<CompetitorsListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.discovery_status) queryParams.append('discovery_status', params.discovery_status);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.brand_search) queryParams.append('brand_search', params.brand_search);
    if (params.auto_generate) queryParams.append('auto_generate', 'true');

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/competitor?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<CompetitorsListResponse>(response);

    return result;
  },

  async createBrand(
    token: string,
    workspaceId: string,
    brandData: {
      name: string;
      domain: string;
      aliases?: string[];
    }
  ): Promise<CompetitorResponse> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/brand?workspace_id=${workspaceId}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandData),
    });

    const result = await handleResponse<CompetitorResponse>(response);

    return result;
  },

  async updateBrand(
    token: string,
    workspaceId: string,
    brandId: string,
    updateData: {
      name?: string;
      domain?: string;
      aliases?: string[];
      discovery_status?: string;
      is_active?: boolean;
    }
  ): Promise<CompetitorResponse> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/brand/${brandId}?workspace_id=${workspaceId}`;

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await handleResponse<CompetitorResponse>(response);

    return result;
  },

  async deleteBrand(token: string, workspaceId: string, brandId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/competitors/${brandId}`;

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete competitor' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to delete competitor');
    }
  },

  async updateBrandStatus(token: string, workspaceId: string, brandId: string, request: { discovery_status: string }): Promise<CompetitorResponse> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/brand/${brandId}/status`;

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update brand status' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to update brand status');
    }

    return response.json();
  },

  async updateOrCreatePrimaryBrand(
    token: string,
    workspaceId: string,
    brandData: {
      name: string;
      domain: string;
      aliases?: string[];
      keywords?: string[];
    }
  ): Promise<CompetitorResponse> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/primary-brand`;

    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(brandData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update primary brand' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to update primary brand');
    }

    return response.json();
  },

  async getPromptTemplate(token: string, workspaceId: string, templateId: string): Promise<PromptTemplateSummary> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/prompt-templates/${templateId}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch prompt template' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to fetch prompt template');
    }

    return response.json();
  },

  async deletePromptTemplate(token: string, workspaceId: string, templateId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/prompt-templates/${templateId}`;

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete prompt template' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to delete prompt template');
    }
  },

  async getSpecificBrandAnalytics(
    token: string,
    params: {
      workspace_id: string;
      brand_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
    }
  ): Promise<DashboardAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/brand/${params.brand_id}?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<DashboardAnalytics>(response);

    return result;
  },

  async getSources(
    token: string,
    params: {
      workspace_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
      page?: number;
      page_size?: number;
    }
  ): Promise<SourceAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/sources?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<SourceAnalytics>(response);

    return result;
  },

  async getURLAnalytics(
    token: string,
    params: {
      workspace_id: string;
      source_id?: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
      page?: number;
      page_size?: number;
    }
  ): Promise<{
    status: string;
    message: string;
    data: {
      citations: Array<{
        url: string;
        title: string;
        usage_count: number;
      }>;
      total_citations: number;
      filters_applied: {
        date_range: {
          start_date: string;
          end_date: string;
        };
        models: string[];
        tags: string[];
        source_id: string | null;
        domain: string | null;
        total_responses_filtered: number;
        total_citations_found: number;
      };
      pagination: {
        current_page: number;
        page_size: number;
        total_pages: number;
        total_items: number;
        has_next: boolean;
        has_previous: boolean;
        next_page: number | null;
        previous_page: number | null;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.source_id) queryParams.append('source_id', params.source_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/urls?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<{
      status: string;
      message: string;
      data: {
        citations: Array<{
          url: string;
          title: string;
          usage_count: number;
        }>;
        total_citations: number;
        filters_applied: {
          date_range: {
            start_date: string;
            end_date: string;
          };
          models: string[];
          tags: string[];
          source_id: string | null;
          domain: string | null;
          total_responses_filtered: number;
          total_citations_found: number;
        };
        pagination: {
          current_page: number;
          page_size: number;
          total_pages: number;
          total_items: number;
          has_next: boolean;
          has_previous: boolean;
          next_page: number | null;
          previous_page: number | null;
        };
      };
    }>(response);

    return result;
  },

  async getURLsDetailedAnalytics(
    token: string,
    params: {
      workspace_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
      page?: number;
      page_size?: number;
    }
  ): Promise<SourceAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/urls-detailed?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<SourceAnalytics>(response);

    return result;
  },

  async getPromptSpecificURLs(
    token: string,
    params: {
      prompt_template_id: string;
      source_id: string;
      workspace_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      page?: number;
      page_size?: number;
    }
  ): Promise<{
    status: string;
    message: string;
    data: {
      citations: Array<{
        url: string;
        title: string;
        usage_count: number;
      }>;
      total_citations: number;
      prompt_template: {
        id: string;
        template_text: string;
      };
      source_info: {
        id: string;
        domain: string;
        display_name: string;
        source_type: string;
      };
      filters_applied: {
        date_range: {
          start_date: string;
          end_date: string;
        };
        models: string[];
        prompt_template_id: string;
        source_id: string;
        total_responses_filtered: number;
      };
      pagination: {
        current_page: number;
        page_size: number;
        total_pages: number;
        total_items: number;
        has_next: boolean;
        has_previous: boolean;
        next_page: number | null;
        previous_page: number | null;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('prompt_template_id', params.prompt_template_id);
    queryParams.append('source_id', params.source_id);
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/prompt/urls?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<{
      status: string;
      message: string;
      data: {
        citations: Array<{
          url: string;
          title: string;
          usage_count: number;
        }>;
        total_citations: number;
        prompt_template: {
          id: string;
          template_text: string;
        };
        source_info: {
          id: string;
          domain: string;
          display_name: string;
          source_type: string;
        };
        filters_applied: {
          date_range: {
            start_date: string;
            end_date: string;
          };
          models: string[];
          prompt_template_id: string;
          source_id: string;
          total_responses_filtered: number;
        };
        pagination: {
          current_page: number;
          page_size: number;
          total_pages: number;
          total_items: number;
          has_next: boolean;
          has_previous: boolean;
          next_page: number | null;
          previous_page: number | null;
        };
      };
    }>(response);

    return result;
  },

  async getPromptDashboard(
    token: string,
    params: {
      workspace_id: string;
      prompt_template_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
    }
  ): Promise<DashboardAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    queryParams.append('prompt_template_id', params.prompt_template_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/prompt-dashboard?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<DashboardAnalytics>(response);

    return result;
  },

  async getPromptSpecificBrandAnalytics(
    token: string,
    params: {
      workspace_id: string;
      prompt_template_id: string;
      brand_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
    }
  ): Promise<PromptSpecificBrandAnalytics> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    queryParams.append('prompt_template_id', params.prompt_template_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/prompt-brand/${params.brand_id}?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<PromptSpecificBrandAnalytics>(response);

    return result;
  },

  // Get provider response details
  async getProviderResponseDetails(token: string, providerResponseId: string, workspaceId: string): Promise<ProviderResponseDetails> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/provider-response/${providerResponseId}?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<ProviderResponseDetails>(response);

    return result;
  },

  // Get chat responses list
  async getChatResponses(
    token: string,
    params: {
      workspace_id: string;
      start_date?: string;
      end_date?: string;
      models?: string[];
      tags?: string[];
      status?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<ChatResponsesListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', params.workspace_id);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/analytics/provider-response?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<ChatResponsesListResponse>(response);

    return result;
  },

  // Suggested Prompts API Methods
  async generateSuggestedPrompts(token: string, workspaceId: string): Promise<SuggestedPromptsBatchResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<SuggestedPromptsBatchResponse>(response);
  },

  async generateCategoryPrompts(token: string, workspaceId: string, category: string): Promise<SuggestedPromptsBatchResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/generate-category`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category }),
    });

    return handleResponse<SuggestedPromptsBatchResponse>(response);
  },

  /**
   * B1: Get suggested prompt seeds (queries) from QuerySeedingService
   * Returns real-world search queries with volume, competition, and quality scores
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @param params - Optional filters (category, limit)
   * @returns Seed queries with search volume and competition metrics
   */
  async getSuggestedPromptSeeds(
    token: string,
    workspaceId: string,
    params?: {
      category?: string;
      limit?: number;
    }
  ): Promise<SuggestedPromptSeedsResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/seeds?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<SuggestedPromptSeedsResponse>(response);
  },

  /**
   * B2: Generate custom category prompts with quality filtering
   * Generates prompts for a custom category using B1 seed queries and B3 quality scoring
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @param request - Generation parameters (category name, count, quality threshold, etc.)
   * @returns Generated prompts with quality scores
   */
  async generateCustomCategoryPrompts(
    token: string,
    workspaceId: string,
    request: {
      /** Custom category name (required, max 100 chars) */
      category: string;
      /** Number of prompts to generate (5-20, default 10) */
      num_prompts: number;
      /** Whether to use seed queries from B1 (default true) */
      use_seed_queries: boolean;
      /** Minimum quality score threshold (0.0-1.0, default 0.2 - set in backend, not frontend) */
      min_quality_score?: number;
      /** Grounding strategy ID (optional, defaults to "balanced" in backend) */
      strategy_id?: string;
      /** Manual keywords to use instead of seed queries (optional) */
      manual_keywords?: string[];
      /** Custom filters for advanced strategy configuration (optional) */
      custom_filters?: {
        volume_range: [number, number];
        competition_levels: ('HIGH' | 'MEDIUM' | 'LOW')[];
        min_quality_score: number;
      };
    }
  ): Promise<SuggestedPromptsBatchResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/generate-category`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return handleResponse<SuggestedPromptsBatchResponse>(response);
  },

  // ===========================
  // Phase 3: Enhanced Suggested Prompts - Grounding Strategy API
  // ===========================

  /**
   * Get strategy recommendation based on onboarding answers
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @param answers - Onboarding wizard answers (business_goal, seo_resources, industry_competition)
   * @returns Recommended strategy ID with reasoning and alternatives
   */
  async getStrategyRecommendation(
    token: string,
    workspaceId: string,
    answers: {
      business_goal: 'quick_roi' | 'visibility' | 'authority';
      seo_resources: 'none' | 'moderate' | 'dedicated';
      industry_competition: 'low' | 'medium' | 'high';
    }
  ): Promise<{
    recommended_strategy_id: string;
    reason: string;
    alternative_strategies: string[];
    next_steps: string[];
  }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/recommend-strategy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to get strategy recommendation' }));
      const errorMessage =
        typeof errorData.detail === 'object' && errorData.detail?.message
          ? errorData.detail.message
          : errorData.detail || 'Failed to get strategy recommendation';

      console.error('[API] Strategy recommendation error:', {
        status: response.status,
        message: errorMessage,
        answers,
      });

      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  },

  /**
   * Get all available grounding strategies
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @returns Array of all 6 grounding strategies with configuration
   */
  async getGroundingStrategies(
    token: string,
    workspaceId: string
  ): Promise<{
    strategies: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
      filters: Record<string, unknown>[];
      order_by: string[];
      limit: number;
      expected_results: {
        avg_search_volume: number;
        avg_competition: string;
        estimated_prompts: number;
        typical_cpc_range: string;
        time_to_rank: string;
      };
    }>;
  }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/strategies`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch strategies' }));
      const errorMessage =
        typeof errorData.detail === 'object' && errorData.detail?.message
          ? errorData.detail.message
          : errorData.detail || 'Failed to fetch strategies';

      console.error('[API] Get strategies error:', {
        status: response.status,
        message: errorMessage,
      });

      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  },

  async updatePromptStatus(
    token: string,
    workspaceId: string,
    templateId: string,
    request: UpdatePromptStatusRequest
  ): Promise<PromptTemplateResponse> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/prompt-templates/${templateId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return handleResponse<PromptTemplateResponse>(response);
  },

  async getWorkspaceCapacity(token: string, workspaceId: string): Promise<WorkspaceCapacity> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/capacity`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse<WorkspaceCapacity>(response);
  },

  async clearSuggestedPrompts(token: string, workspaceId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to clear suggested prompts' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to clear suggested prompts');
    }
  },

  async deleteSuggestedPrompt(token: string, workspaceId: string, templateId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/prompt-templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to delete suggested prompt' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to delete suggested prompt');
    }
  },

  // Suggested Competitors API Methods
  async generateSuggestedCompetitors(
    token: string,
    workspaceId: string
  ): Promise<{
    competitors: Array<{
      brand_id: string;
      name: string;
      domain: string;
      discovery_status: string;
      is_active: boolean;
    }>;
    total_generated: number;
  }> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-competitors/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<{
      competitors: Array<{
        brand_id: string;
        name: string;
        domain: string;
        discovery_status: string;
        is_active: boolean;
      }>;
      total_generated: number;
    }>(response);
  },

  async listSuggestedCompetitors(
    token: string,
    workspaceId: string
  ): Promise<
    Array<{
      brand_id: string;
      name: string;
      domain: string;
      discovery_status: string;
      is_active: boolean;
    }>
  > {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-competitors`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<
      Array<{
        brand_id: string;
        name: string;
        domain: string;
        discovery_status: string;
        is_active: boolean;
      }>
    >(response);
  },

  // Onboarding-specific API Methods
  /**
   * List all active prompt templates for a workspace (for onboarding auto-fill)
   * Returns active prompts that were created during onboarding
   */
  async listWorkspacePromptTemplates(
    token: string,
    workspaceId: string,
    params?: {
      is_active?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<PromptTemplateListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/prompt-templates?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<PromptTemplateListResponse>(response);
  },

  /**
   * List competitors/brands for a workspace (for onboarding auto-fill)
   * Simplified version for onboarding that returns active tracked competitors
   */
  async listWorkspaceCompetitors(token: string, workspaceId: string): Promise<CompetitorResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('workspace_id', workspaceId);
    queryParams.append('is_active', 'true');
    queryParams.append('include_suggested', 'false'); // Only tracked competitors

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/competitors?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<CompetitorResponse[]>(response);
  },

  /**
   * List suggested prompts with cursor-based pagination (Load More pattern)
   * Supports cumulative loading of all suggested prompts in a workspace
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @param params - Pagination and filter options
   * @returns Paginated prompts with has_more flag for Load More button
   */
  async listSuggestedPrompts(
    token: string,
    workspaceId: string,
    params?: {
      offset?: number;
      limit?: number;
      category?: string;
      sort_by?: 'recent' | 'quality' | 'category';
    }
  ): Promise<PromptTemplateListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/workspace/${workspaceId}/suggested-prompts/list?${queryParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<PromptTemplateListResponse>(response);
  },
};

// Company Users API
export const companyUsersApi = {
  // Get all company users
  async getCompanyUsers(token: string): Promise<CompanyUser[]> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to fetch company users: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Backend returns array directly
  },

  // Create a new company user
  async createCompanyUser(token: string, userData: CreateCompanyUserRequest): Promise<CompanyUser> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to create company user: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Backend returns UserResponse directly
  },

  // Delete a company user
  async deleteCompanyUser(token: string, userId: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/company/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete company user: ${response.statusText}`);
    }
  },
};

// Export API
export const exportApi = {
  // Get export statistics
  async getExportStatistics(
    token: string,
    workspaceId: string,
    params: {
      date_from: string;
      date_to: string;
      models?: string[];
      tags?: string[];
      is_active?: boolean;
    }
  ): Promise<ExportStatistics> {
    const queryParams = new URLSearchParams();
    queryParams.append('date_from', params.date_from);
    queryParams.append('date_to', params.date_to);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.is_active !== undefined) {
      queryParams.append('is_active', params.is_active.toString());
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/chat-responses/statistics?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<ExportStatistics>(response);
    return result;
  },

  // Preview export data
  async previewExport(
    token: string,
    workspaceId: string,
    params: {
      date_from: string;
      date_to: string;
      models?: string[];
      tags?: string[];
      is_active?: boolean;
      format?: string;
    }
  ): Promise<ExportPreviewResponse> {
    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/chat-responses/preview`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await handleResponse<ExportPreviewResponse>(response);
    return result;
  },

  // Download CSV export
  async downloadCsv(
    token: string,
    workspaceId: string,
    params: {
      date_from: string;
      date_to: string;
      models?: string[];
      tags?: string[];
      is_active?: boolean;
      format?: string;
    }
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('date_from', params.date_from);
    queryParams.append('date_to', params.date_to);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.is_active !== undefined) {
      queryParams.append('is_active', params.is_active.toString());
    }
    if (params.format) {
      queryParams.append('format', params.format);
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/chat-responses?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, `Failed to download CSV: ${errorText}`);
    }

    return response.blob();
  },

  // NEW: Sources export methods
  async getSourcesExportStatistics(token: string, workspaceId: string, params: SourcesExportParams): Promise<SourcesExportStatistics> {
    const queryParams = new URLSearchParams();

    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.models?.length) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.domains?.length) {
      params.domains.forEach(domain => queryParams.append('domains', domain));
    }
    if (params.urls?.length) {
      params.urls.forEach(url => queryParams.append('urls', url));
    }
    if (params.source_types?.length) {
      params.source_types.forEach(type => queryParams.append('source_types', type));
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/sources-citations/statistics?${queryParams}`;

    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new ApiError(response.status, `Failed to get sources export statistics: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  },

  async downloadSourcesCsv(token: string, workspaceId: string, params: SourcesExportParams): Promise<Blob> {
    const queryParams = new URLSearchParams();

    // Add all parameters (same as above)
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.models?.length) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.domains?.length) {
      params.domains.forEach(domain => queryParams.append('domains', domain));
    }
    if (params.urls?.length) {
      params.urls.forEach(url => queryParams.append('urls', url));
    }
    if (params.source_types?.length) {
      params.source_types.forEach(type => queryParams.append('source_types', type));
    }
    if (params.export_type) {
      queryParams.append('export_type', params.export_type);
    }
    if (params.format) {
      queryParams.append('format', params.format);
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/sources-citations/export?${queryParams}`;

    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new ApiError(response.status, `Failed to download sources CSV: ${JSON.stringify(errorData)}`);
    }

    return response.blob();
  },

  // NEW: Prompts & Brand Mentions export methods
  async getPromptsExportStatistics(token: string, workspaceId: string, params: PromptsExportParams): Promise<PromptsExportStatistics> {
    const queryParams = new URLSearchParams();

    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.models?.length) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.categories?.length) {
      params.categories.forEach(category => queryParams.append('categories', category));
    }
    if (params.brand_names?.length) {
      params.brand_names.forEach(brand => queryParams.append('brand_names', brand));
    }
    if (params.sentiment_labels?.length) {
      params.sentiment_labels.forEach(sentiment => queryParams.append('sentiment_labels', sentiment));
    }
    if (params.is_primary_brand !== undefined) {
      queryParams.append('is_primary_brand', params.is_primary_brand.toString());
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/prompts-mentions/statistics?${queryParams}`;

    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new ApiError(response.status, `Failed to get prompts export statistics: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  },

  async downloadPromptsCsv(token: string, workspaceId: string, params: PromptsExportParams): Promise<Blob> {
    const queryParams = new URLSearchParams();

    // Add all parameters
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.models?.length) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.categories?.length) {
      params.categories.forEach(category => queryParams.append('categories', category));
    }
    if (params.brand_names?.length) {
      params.brand_names.forEach(brand => queryParams.append('brand_names', brand));
    }
    if (params.sentiment_labels?.length) {
      params.sentiment_labels.forEach(sentiment => queryParams.append('sentiment_labels', sentiment));
    }
    if (params.is_primary_brand !== undefined) {
      queryParams.append('is_primary_brand', params.is_primary_brand.toString());
    }
    if (params.export_type) {
      queryParams.append('export_type', params.export_type);
    }
    if (params.format) {
      queryParams.append('format', params.format);
    }

    const baseUrl = getBaseUrl();
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/exports/prompts-mentions/export?${queryParams}`;

    const response = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new ApiError(response.status, `Failed to download prompts CSV: ${JSON.stringify(errorData)}`);
    }

    return response.blob();
  },

  // Dashboard Graph Export
  async getDashboardExportStatistics(token: string, workspaceId: string, params: DashboardExportRequest): Promise<DashboardExportStatistics> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.export_type) queryParams.append('export_type', params.export_type);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const response = await fetch(`${getBaseUrl()}/workspace/${workspaceId}/exports/dashboard-graph/statistics?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to get dashboard export statistics' }));
      throw new ApiError(response.status, errorData.detail || 'Failed to get dashboard export statistics');
    }

    return response.json();
  },

  async downloadDashboardGraphCsv(token: string, workspaceId: string, params: DashboardExportRequest): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.export_type) queryParams.append('export_type', params.export_type);
    if (params.models) {
      params.models.forEach(model => queryParams.append('models', model));
    }
    if (params.tags) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const response = await fetch(`${getBaseUrl()}/workspace/${workspaceId}/exports/dashboard-graph?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, `Failed to download dashboard export: ${errorText}`);
    }

    return response.blob();
  },
};

export const brandLogoApi = {
  /**
   * Get brand logo by domain with backend caching
   *
   * @param token - Auth token
   * @param workspaceId - Workspace ID
   * @param domain - Domain to fetch logo for
   * @returns BrandIconResponse with logo URL and cache info
   */
  async getLogoByDomain(token: string, workspaceId: string, domain: string): Promise<BrandIconResponse> {
    const baseUrl = getBaseUrl();
    const queryParams = new URLSearchParams({ domain });
    const fullUrl = `${baseUrl}/workspace/${workspaceId}/brands/logo?${queryParams}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new ApiError(response.status, errorData.detail || `Failed to fetch logo for ${domain}`);
    }

    return await response.json();
  },
};

// Re-export collections API
export { collectionsApi, CollectionApiError } from './collections';
export type { CollectionTriggerResponse, CollectionStatusResponse, CollectionHistoryItem, CollectionHistoryResponse } from './collections';

export { ApiError };
