export interface GetFilterOptionsParams {
  workspace_id: string;
  [key: string]: unknown;
}
export interface FilterOptionsResponse {
  status: string;
  message: string;
  data: {
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
  };
}
export interface GetDashboardParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[] | string | undefined;
  tags?: string[] | string | undefined;
  [key: string]: unknown;
}
export interface GetPromptsParams {
  workspace_id: string;
  brand_id: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  [key: string]: unknown;
}
export interface GetProviderResponsesParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  status?: string;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface CreatePromptTemplateParams {
  workspace_id: string;
  name: string;
  description?: string;
  template_text: string;
  tags?: string[];
  model?: string;
  temperature?: number;
}
export interface UpdatePromptTemplateParams {
  workspace_id: string;
  prompt_id: string;
  name?: string;
  description?: string;
  template_text?: string;
  tags?: string[];
  model?: string;
  temperature?: number;
}
export interface GetCompetitorsParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface CreateBrandParams {
  workspace_id: string;
  name: string;
  domain: string;
  aliases?: string[];
}
export interface UpdateBrandParams {
  workspace_id: string;
  brand_id: string;
  name?: string;
  domain?: string;
  aliases?: string[];
  discovery_status?: string;
  is_active?: boolean;
}
export interface DeleteBrandParams {
  workspace_id: string;
  brand_id: string;
}
export interface UpdateBrandStatusParams {
  workspace_id: string;
  brand_id: string;
  discovery_status: string;
}
export interface UpdateOrCreatePrimaryBrandParams {
  workspace_id: string;
  name: string;
  domain: string;
  aliases?: string[];
  keywords?: string[];
}
export interface GetPromptTemplateParams {
  workspace_id: string;
  template_id: string;
}
export interface DeletePromptTemplateParams {
  workspace_id: string;
  template_id: string;
}
export interface GetSpecificBrandAnalyticsParams {
  workspace_id: string;
  brand_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[] | undefined;
  tags?: string[] | undefined;
  [key: string]: unknown;
}
export interface GetSourcesParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface GetURLAnalyticsParams {
  workspace_id: string;
  source_id?: string;
  start_date?: string;
  end_date?: string;
  models?: string[] | undefined;
  tags?: string[] | undefined;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface URLAnalyticsResponse {
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
}
export interface GetURLsDetailedAnalyticsParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface GetPromptSpecificURLsParams {
  prompt_template_id: string;
  source_id: string;
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[] | undefined;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface PromptSpecificURLsResponse {
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
}
export interface GetPromptDashboardParams {
  workspace_id: string;
  prompt_template_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  [key: string]: unknown;
}
export interface GetPromptSpecificBrandAnalyticsParams {
  workspace_id: string;
  prompt_template_id: string;
  brand_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  [key: string]: unknown;
}
export interface GetProviderResponseDetailsParams {
  provider_response_id: string;
  workspace_id: string;
  [key: string]: unknown;
}
export interface GetChatResponsesParams {
  workspace_id: string;
  start_date?: string;
  end_date?: string;
  models?: string[];
  tags?: string[];
  status?: string;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
export interface GenerateSuggestedPromptsParams {
  workspace_id: string;
}
export interface GenerateCustomCategoryPromptsRequest {
  category: string;
  num_prompts: number;
  use_seed_queries: boolean;
  min_quality_score?: number;
  strategy_id?: string;
  manual_keywords?: string[];
  custom_filters?: {
    volume_range: [number, number];
    competition_levels: ('HIGH' | 'MEDIUM' | 'LOW')[];
    min_quality_score: number;
  };
}
export interface StrategyRecommendationRequest {
  business_goal: 'quick_roi' | 'visibility' | 'authority';
  seo_resources: 'none' | 'moderate' | 'dedicated';
  industry_competition: 'low' | 'medium' | 'high';
}
export interface StrategyRecommendationResponse {
  recommended_strategy_id: string;
  reason: string;
  alternative_strategies: string[];
  next_steps: string[];
}
export interface GroundingStrategy {
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
}
export interface GroundingStrategiesResponse {
  strategies: GroundingStrategy[];
}
export interface GenerateSuggestedCompetitorsResponse {
  competitors: Array<{
    brand_id: string;
    name: string;
    domain: string;
    discovery_status: string;
    is_active: boolean;
  }>;
  total_generated: number;
}
export interface SuggestedCompetitor {
  brand_id: string;
  name: string;
  domain: string;
  discovery_status: string;
  is_active: boolean;
}
export interface ListSuggestedPromptsParams {
  offset?: number;
  limit?: number;
  category?: string;
  sort_by?: 'recent' | 'quality' | 'category';
  [key: string]: unknown;
}
