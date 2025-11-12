export interface OnboardingStatus {
  user_onboarded: boolean;
  workspace_onboarded: boolean;
  needs_setup: boolean;
  needs_tour: boolean;
  workspace_name: string;
  user_name: string;
  workspace_id: string;
}

export interface OnboardingProgress {
  competitor_count: number;
  prompt_count: number;
  has_collection: boolean;
  min_competitors: number;
  min_prompts: number;
  ready_for_collection: boolean;
  can_complete: boolean;
}

export interface CompleteOnboardingResponse {
  success: boolean;
  entity_id: string;
  entity_type: 'user' | 'workspace';
  completed_at: string;
  message: string;
}
