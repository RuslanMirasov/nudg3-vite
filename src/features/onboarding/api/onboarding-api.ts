import { api } from '@/shared/lib/apiClient';
import type { OnboardingStatus, OnboardingProgress, CompleteOnboardingResponse } from '@/features/onboarding/types/onboarding-types';

/**
 * Onboarding API Client
 *
 * Handles user and workspace onboarding flows.
 */

// ==================== API Functions ====================

export const onboardingApi = {
  /**
   * Get current user's onboarding status for a specific workspace
   *
   * Determines which onboarding flow the user needs:
   * - Full setup (workspace not onboarded)
   * - Tour only (workspace onboarded, user not onboarded)
   * - None (both onboarded)
   *
   * @param workspaceId - Optional workspace ID. If omitted, uses user's primary workspace.
   */
  getOnboardingStatus: (workspaceId?: string) =>
    api.get<OnboardingStatus>(workspaceId ? `/onboarding/status?workspace_id=${workspaceId}` : `/onboarding/status`),

  /**
   * Get workspace setup progress
   *
   * Returns current counts of competitors, prompts, and collection runs
   * to determine if workspace is ready to complete onboarding.
   *
   * @param workspaceId - Optional workspace ID. If omitted, uses user's primary workspace.
   */
  getOnboardingProgress: (workspaceId?: string) =>
    api.get<OnboardingProgress>(workspaceId ? `/onboarding/progress?workspace_id=${workspaceId}` : `/onboarding/progress`),

  /**
   * Complete workspace onboarding
   *
   * Validates that workspace has:
   * - Minimum 3 active competitors
   * - Minimum 3 active prompts
   * - At least 1 collection run
   *
   * Then marks workspace as onboarded and optionally saves location configuration.
   *
   * @param workspaceId - Workspace ID.
   * @param location - Optional location configuration (country, city, region)
   */
  completeWorkspaceOnboarding: (workspaceId: string, location?: { country: string; city?: string; region?: string }) =>
    api.post<CompleteOnboardingResponse>(`/onboarding/${workspaceId}/complete`, location ? { location } : {}),

  /**
   * Complete user onboarding
   *
   * Marks user's onboarding tour as complete.
   *
   * NOTE: This is NOT called by workspace onboarding in the current implementation.
   * User onboarding (platform tour) will be implemented as a separate flow in the future.
   * This endpoint is ready for that future implementation.
   */
  completeUserOnboarding: () => api.post<CompleteOnboardingResponse>(`/onboarding/user/complete`),
};
