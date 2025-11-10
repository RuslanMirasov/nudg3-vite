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

export interface BrandIconResponse {
  brand_id: string | null;
  domain: string;
  icon_url: string | null;
  source: string;
  cached: boolean;
  cached_at: string | null;
  brand_colors?: string[];
}
