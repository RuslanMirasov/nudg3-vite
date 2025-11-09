export interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  agency_id: string | null;
  company_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    user_type: string;
    agency_id: string | null;
    company_id: string;
  };
}

export interface Company {
  id: string;
  agency_id?: string | null;
  name: string;
  domain?: string;
  contact_email?: string;
  settings?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  domain?: string;
  contact_email?: string;
  settings?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SetInitialPasswordRequest {
  password: string;
}

export interface PasswordSetResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface SignupRequest {
  email: string;
  name: string;
}

export interface SignupResponse {
  message: string;
  user_id: string;
  email: string;
  workspace_id: string;
  trial_end_date: string;
}

export interface VerifyEmailResponse {
  message: string;
  access_token: string;
  token_type: string;
  trial_end_date: string;
  workspace_id: string;
  needs_password_setup: boolean;
  user?: User;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface TrialStatusResponse {
  is_trial: boolean;
  status: 'active' | 'expired' | 'none';
  days_remaining: number;
  trial_end_date: string;
  total_trial_days: number;
  message: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_prompts_per_day?: number | null;
  features: Record<string, unknown>;
  is_active: boolean;
}

export interface CheckoutResponse {
  payment_url: string;
  subscription_id: string;
}

export interface SubscriptionStatusResponse {
  is_trial: boolean;
  status: 'trial' | 'active' | 'expired' | 'pending' | 'past_due' | 'cancelled';
  plan_name?: string;
  price?: number;
  currency?: string;
  trial_end_date?: string;
  next_billing_date?: string;
}

export interface UsageSummaryResponse {
  total_prompts_month: number;
  total_workspaces: number;
  avg_daily_prompts: number;
  workspaces: WorkspaceUsageSummary[];
}

export interface WorkspaceUsageSummary {
  id: string;
  name: string;
  max_prompts: number;
  prompts_used_today: number;
  prompts_used_month: number;
}

export interface PaymentTransactionResponse {
  id: string;
  amount?: number;
  currency?: string;
  status: string;
  transaction_date?: string;
  payment_method?: string;
  payfast_payment_id?: string;
}

export interface Workspace {
  id: string;
  name: string;
  brand_name: string;
  brand_domain: string | null;
  brand_keywords: string[];
  tracking_keywords?: Record<string, string[]>;
  provider_configs?: Record<string, Record<string, string | boolean>>;
  max_prompts: number | null;
  settings:
    | {
        collection_frequency?: string;
        alert_threshold?: number;
      }
    | Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  default_location_country: string | null;
  default_location_city: string | null;
  default_location_region: string | null;
  brands_count?: number;
  collection_runs_count?: number;
  last_collection_run?: string | null;
  company_id?: string;
  company_name?: string;
  agency_id?: string;
  agency_name?: string;
  subscription_status?: 'trial' | 'active' | 'expired' | 'pending' | 'past_due' | 'cancelled';
  trial_end_date?: string;
  is_trial?: boolean;
}

export interface WorkspaceCapacity {
  workspace_id: string;
  max_prompts: number | null;
  active_prompts: number;
  available_prompts: number | null;
  is_unlimited: boolean;
  at_capacity: boolean;
}

export interface DashboardAnalytics {
  status: string;
  message: string;
  data: {
    prompt_template?: {
      template_text: string;
    };
    brands: Record<
      string,
      {
        visibility_score: Record<string, number>;
        sentiment: number;
        position: number;
        domain: string;
        brand_colors?: string[];
      }
    >;
    recent_chats: Array<{
      prompt_text?: string;
      provider_response_id?: string;
      prompt_template_id?: string;
      response_text: string;
      model: string;
      created_at: string;
      brand_mentions?: Array<{
        brand_name: string;
        visibility_score: number;
        sentiment_score: number;
        position_rank: number;
      }>;
      brand_domains?: string[];
    }>;
    sources_usage: Record<string, number>[];
    filters_applied?: {
      models: string[] | null;
      tags: string[] | null;
      start_date: string;
      end_date: string;
    };
  };
}

export interface PromptSpecificBrandAnalytics {
  status: string;
  message: string;
  data: {
    prompt_template: {
      template_text: string;
    };
    brand_name: string;
    brand_domain: string;
    visibility_data: Record<string, number>;
    average_sentiment: number;
    average_position: number;
    total_mentions: number;
  };
}

export interface PromptAnalytics {
  status: string;
  message: string;
  data: {
    prompts: Array<{
      id: string;
      prompt_text: string;
      status: string;
      tags: string[];
      created_at: string;
      seed_query?: string | null;
      seed_source?: string | null;
      grounding_context?: {
        related_searches?: string[];
        people_also_ask?: string[];
        serp_items?: Array<{
          title?: string;
          description?: string;
          url?: string;
        }>;
        metadata?: Record<string, unknown>;
        search_volume?: number;
        cpc?: number;
        competition_level?: 'HIGH' | 'MEDIUM' | 'LOW';
        source?: string;
        fetched_at?: string;
      } | null;
      metrics: {
        visibility_percentage: number;
        avg_sentiment_score: number | null;
        avg_position_rank: number | null;
        total_mentions: number;
        responses_with_mentions: number;
        total_responses: number;
        brand_domains: string[];
      };
    }>;
    total: number;
    filters_applied: {
      status: string | null;
      models: string[] | null;
      tags: string[] | null;
      start_date: string;
      end_date: string;
      brand_id: string;
    };
    date_range: {
      start_date: string;
      end_date: string;
    };
  };
}

export interface CompetitorResponse {
  brand_id: string;
  name: string;
  domain: string | null;
  aliases?: string[];
  is_primary: boolean;
  discovery_status: string;
  is_active: boolean;
}

export interface BrandIconResponse {
  brand_id: string | null;
  domain: string;
  icon_url: string | null;
  source: string;
  cached: boolean;
  cached_at: string | null;
  brand_colors?: string[];
}

export interface PaginationMetadata {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CompetitorsListResponse {
  competitors: CompetitorResponse[];
  pagination: PaginationMetadata;
}

export interface ProviderResponseDetails {
  success: boolean;
  message: string;
  data: {
    id: string;
    response_text: string;
    provider: string;
    model: string;
    created_at: string;
    response_time_ms?: number;
    cost_usd?: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    search_query_count?: number;
    search_queries?: string[];
    prompt_template_text?: string;
    brand_mentions: Array<{
      id: string;
      brand_name: string;
      is_primary_brand: boolean;
      competitor_domain?: string | null;
      sentiment_score: number;
      sentiment_label: string;
      position_rank: number;
      mention_context: string;
      context_start?: number | null;
      context_end?: number | null;
      context_type?: string | null;
      mention_strength?: string | null;
      feature_categories?: string[];
      sentiment_confidence?: number | null;
      positive_indicators?: string[];
      negative_indicators?: string[];
      sentiment_reasoning?: string | null;
      market_position?: string | null;
      positioning_language?: string | null;
      recommendation_reasoning?: string | null;
      extraction_confidence?: number | null;
    }>;
    source_citations: Array<{
      url: string;
      title: string;
      domain: string;
      source_domain?: string;
      position: number;
      citation_indices?: Array<{
        start: number;
        end: number;
        text?: string;
      }>;
      icon_url?: string | null;
      icon_cache_source?: string | null;
      source_colors?: string[];
    }>;
    total_brands_mentioned: number;
    primary_brand_mentions: number;
    competitor_mentions: number;
    total_citations: number;
  };
  metadata: Record<string, string | number | boolean>;
}

export interface ChatResponseSummary {
  id: string;
  response_text_truncated: string;
  prompt_text_truncated?: string;
  provider: string;
  model: string;
  created_at: string;
  brand_mentions_count: number;
  top_brands: string[];
}

export interface ChatResponsesListResponse {
  status: string;
  message: string;
  data: {
    provider_responses: ChatResponseSummary[];
    total_responses: number;
    filters_applied: {
      date_range: {
        start_date: string;
        end_date: string;
      };
      models: string[];
      tags: string[];
      status?: string;
      total_responses_filtered: number;
    };
    pagination: {
      current_page: number;
      page_size: number;
      total_pages: number;
      total_items: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

export interface SourceAnalytics {
  status: string;
  message: string;
  data: {
    sources: Array<{
      source_id: string;
      domain: string;
      display_name: string;
      source_type: string;
      usage_percentage: number;
      icon_url?: string | null;
      icon_cache_source?: string | null;
      source_colors?: string[];
    }>;
    total_sources: number;
    top_5_usage: Record<string, Record<string, number>>;
    date_range: {
      start_date: string;
      end_date: string;
    };
    filters_applied: {
      models: string[];
      tags: string[];
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
}

export interface PromptTemplate {
  id: string;
  template_text: string;
  status: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PromptTemplateResponse {
  id: string;
  workspace_id: string;
  name: string;
  template_text: string;
  category: string;
  tags: string[];
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  quality_score?: number;
  quality_tier?: string;
}

export interface SuccessResponse<T = unknown> {
  message: string;
  data: T;
}

export interface SeedQuery {
  query_text: string;
  search_volume: number | null;
  cpc?: number | null;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
  quality_score: number;
  source: 'dataforseo' | 'serpapi';
}

export interface SuggestedPromptSeedsResponse {
  seeds: SeedQuery[];
  total_available: number;
  generated_at: string;
}

export interface SuggestedPromptsBatchResponse {
  total_generated: number;
  categories?: Record<string, number>;
  prompts: PromptTemplateResponse[];
  category?: string;
  total_filtered?: number;
}

export interface PromptTemplateSummary {
  id: string;
  name: string;
  template_text: string;
  category: string;
  status: string;
  is_active: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  quality_score?: number;
  quality_tier?: string;
  quality_breakdown?: {
    citation_triggers: number;
    problem_focus: number;
    brand_relevance: number;
    search_volume?: number;
  };
  citation_triggers_found?: string[];
  seed_query?: string | null;
  seed_source?: string | null;
  grounding_context?: {
    related_searches?: string[];
    people_also_ask?: string[];
    serp_items?: Array<{
      title?: string;
      description?: string;
      url?: string;
    }>;
    metadata?: Record<string, unknown>;
    search_volume?: number;
    cpc?: number;
    competition_level?: 'HIGH' | 'MEDIUM' | 'LOW';
    source?: string;
    fetched_at?: string;
  } | null;
  is_newly_generated?: boolean;
  prompt?: string;
  geo_opportunity_score?: number;
  geo_score_grade?: string;
  geo_score_components?: {
    mention_likelihood: number;
    commercial_viability: number;
    market_opportunity: number;
    intent_alignment: number;
  };
  geo_score_reasoning?: Record<
    string,
    {
      data_point: string;
      interpretation: string;
      geo_impact: string;
    }
  >;
}

export interface PromptTemplateListResponse {
  templates: PromptTemplateSummary[];
  total: number;
  page: number;
  per_page: number;
}

export interface UpdatePromptStatusRequest {
  status: 'active' | 'inactive' | 'suggested';
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  last_login?: string;
  created_at: string;
  updated_at: string;
  user_type: string;
  is_active: boolean;
  created_by_name?: string;
}

export interface CreateCompanyUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface ExportStatistics {
  total_responses: number;
  date_range: {
    from: string;
    to: string;
  };
  provider_breakdown: Array<{
    model: string;
    count: number;
  }>;
  filters_applied: {
    workspace_id?: string;
    models?: string[];
    tags?: string[];
    is_active?: boolean;
  };
}

export interface SourcesExportStatistics {
  total_citations: number;
  unique_sources: number;
  unique_domains: number;
  unique_urls: number;
  estimated_size_mb: number;
}

export interface ExportPreviewResponse {
  preview_data: Array<{
    id: string;
    model: string;
    user: string;
    assistant: string;
    country: string;
    position: string;
    mentions: string;
    sources: string;
    sentiment: string;
    created: string;
  }>;
  total_records: number;
  preview_count: number;
  estimated_size_mb: number;
  column_info: Record<string, string>;
}

export interface SourcesExportParams {
  date_from?: string;
  date_to?: string;
  models?: string[];
  tags?: string[];
  domains?: string[];
  urls?: string[];
  source_types?: string[];
  export_type?: 'citations' | 'sources' | 'combined';
  format?: 'csv';
}

export interface PromptsExportStatistics {
  total_mentions: number;
  unique_prompts: number;
  unique_brands: number;
  unique_responses: number;
  estimated_size_mb?: number;
}

export interface PromptsExportParams {
  date_from?: string;
  date_to?: string;
  models?: string[];
  tags?: string[];
  categories?: string[];
  brand_names?: string[];
  sentiment_labels?: string[];
  is_primary_brand?: boolean;
  export_type?: 'mentions' | 'prompts' | 'combined';
  format?: string;
}

export interface DashboardExportRequest {
  start_date?: string;
  end_date?: string;
  export_type?: 'timeseries' | 'summary' | 'combined';
  models?: string[];
  tags?: string[];
}

export interface DashboardExportStatistics {
  total_brands: number;
  total_data_points: number;
  date_range_days: number;
  estimated_size_mb: number;
}
