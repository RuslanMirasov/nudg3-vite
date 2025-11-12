/**
 * Trial & Workspace Constants
 * Phase 1 - Agent 1.2 Deliverable
 *
 * Defines default values and constants for trial periods, workspace quotas,
 * and system-wide configuration.
 *
 * IMPORTANT: These constants should match backend configuration.
 */

// ===========================
// Trial Configuration
// ===========================

/**
 * Default trial duration in days
 * New workspaces get this many days of trial access
 */
export const TRIAL_DURATION_DAYS = 7;

/**
 * Trial expiration warning threshold in days
 * Show warning banner when trial has this many days or less remaining
 */
export const TRIAL_WARNING_THRESHOLD_DAYS = 3;

/**
 * Trial expiration critical threshold in days
 * Show urgent warning when trial has this many days or less remaining
 */
export const TRIAL_CRITICAL_THRESHOLD_DAYS = 1;

/**
 * Maximum trial extensions allowed per workspace (admin only)
 * Prevents unlimited trial extensions
 */
export const MAX_TRIAL_EXTENSIONS = 3;

/**
 * Default trial extension duration in days (admin only)
 * How many days to extend trial by default
 */
export const DEFAULT_TRIAL_EXTENSION_DAYS = 7;

// ===========================
// Workspace Quotas
// ===========================

/**
 * Default maximum prompts per day for new workspaces
 * Free tier / trial workspaces get this limit
 */
export const DEFAULT_MAX_PROMPTS = 25;

/**
 * Minimum prompts per day (for paid plans)
 * Cannot set quota below this value
 */
export const MIN_PROMPTS_PER_DAY = 1;

/**
 * Maximum prompts per day (for MVP phase)
 * Cannot set quota above this value
 */
export const MAX_PROMPTS_PER_DAY = 1000;

/**
 * Unlimited prompts indicator
 * null value means unlimited prompts
 */
export const UNLIMITED_PROMPTS = null;

// ===========================
// Quota Usage Thresholds
// ===========================

/**
 * Quota usage warning threshold (percentage)
 * Show warning when usage reaches this percentage
 */
export const QUOTA_WARNING_THRESHOLD = 75;

/**
 * Quota usage critical threshold (percentage)
 * Show critical warning when usage reaches this percentage
 */
export const QUOTA_CRITICAL_THRESHOLD = 90;

/**
 * Quota usage at capacity threshold (percentage)
 * Disable actions when usage reaches this percentage
 */
export const QUOTA_AT_CAPACITY_THRESHOLD = 100;

// ===========================
// Workspace Defaults
// ===========================

/**
 * Default workspace name template
 * Used when user doesn't provide a name during signup
 */
export const DEFAULT_WORKSPACE_NAME_TEMPLATE = "{name}'s Workspace";

/**
 * Default company name template
 * Used when user doesn't provide a company name during signup
 */
export const DEFAULT_COMPANY_NAME_TEMPLATE = "{name}'s Company";

/**
 * Default provider configurations for new workspaces
 * Matches backend default configurations
 */
export const DEFAULT_PROVIDER_CONFIGS = {
  openai: {
    model: 'gpt-4o-mini-search-preview',
  },
  dataforseo: {
    serp_type: 'ai_overviews',
  },
  perplexity: {
    model: 'sonar',
  },
} as const;

/**
 * Default workspace settings
 */
export const DEFAULT_WORKSPACE_SETTINGS = {
  collection_frequency: 'daily',
  alert_threshold: 10,
} as const;

// ===========================
// UI Display Constants
// ===========================

/**
 * Workspace name display max length
 * Truncate workspace names longer than this in lists/dropdowns
 */
export const WORKSPACE_NAME_MAX_DISPLAY_LENGTH = 30;

/**
 * Brand name display max length
 * Truncate brand names longer than this in UI
 */
export const BRAND_NAME_MAX_DISPLAY_LENGTH = 25;

/**
 * Trial countdown refresh interval in milliseconds
 * How often to update trial countdown displays
 */
export const TRIAL_COUNTDOWN_REFRESH_INTERVAL = 60000; // 1 minute

// ===========================
// Validation Constants
// ===========================

/**
 * Workspace name minimum length
 */
export const WORKSPACE_NAME_MIN_LENGTH = 1;

/**
 * Workspace name maximum length
 */
export const WORKSPACE_NAME_MAX_LENGTH = 255;

/**
 * Brand name minimum length
 */
export const BRAND_NAME_MIN_LENGTH = 1;

/**
 * Brand name maximum length
 */
export const BRAND_NAME_MAX_LENGTH = 255;

/**
 * Brand domain maximum length
 */
export const BRAND_DOMAIN_MAX_LENGTH = 255;

/**
 * Location city maximum length
 */
export const LOCATION_CITY_MAX_LENGTH = 100;

/**
 * Location region maximum length
 */
export const LOCATION_REGION_MAX_LENGTH = 100;

/**
 * Location country code length (ISO 3166-1 alpha-2)
 */
export const LOCATION_COUNTRY_CODE_LENGTH = 2;

// ===========================
// Status Display Constants
// ===========================

/**
 * Status badge variants mapping
 * Maps workspace status to Tailwind CSS color variants
 */
export const STATUS_VARIANTS = {
  trial: 'secondary',
  active: 'success',
  expired: 'destructive',
  pending: 'warning',
  past_due: 'warning',
  cancelled: 'default',
} as const;

/**
 * Status labels mapping
 * Human-readable labels for workspace statuses
 */
export const STATUS_LABELS = {
  trial: 'Trial Period',
  active: 'Active',
  expired: 'Expired',
  pending: 'Pending',
  past_due: 'Past Due',
  cancelled: 'Cancelled',
} as const;

/**
 * Quota usage status colors (Tailwind CSS classes)
 */
export const QUOTA_USAGE_COLORS = {
  normal: 'text-green-600',
  warning: 'text-orange-600',
  critical: 'text-red-600',
} as const;

// ===========================
// Feature Flags
// ===========================

/**
 * Enable multi-workspace feature
 * Allow users to create and manage multiple workspaces
 */
export const ENABLE_MULTI_WORKSPACE = true;

/**
 * Enable workspace trial extensions (admin only)
 * Allow admins to extend trial periods
 */
export const ENABLE_TRIAL_EXTENSIONS = true;

/**
 * Enable workspace quota management
 * Allow users to adjust prompt quotas
 */
export const ENABLE_QUOTA_MANAGEMENT = true;

/**
 * Enable workspace deletion
 * Allow users to delete their own workspaces
 */
export const ENABLE_WORKSPACE_DELETION = false; // Disabled for MVP

// ===========================
// API & Routing Constants
// ===========================

/**
 * Workspace API base path
 */
export const WORKSPACE_API_PATH = '/workspace';

/**
 * Trial status API path
 */
export const TRIAL_STATUS_API_PATH = '/trial/status';

/**
 * Subscription checkout API path
 */
export const CHECKOUT_API_PATH = '/subscription/checkout';

/**
 * Workspace settings route
 */
export const WORKSPACE_SETTINGS_ROUTE = '/workspace';

/**
 * Subscription management route
 */
export const SUBSCRIPTION_ROUTE = '/subscription';

/**
 * Upgrade/checkout route
 */
export const UPGRADE_ROUTE = '/subscription/checkout';

// ===========================
// Error Messages
// ===========================

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  WORKSPACE_NOT_FOUND: 'Workspace not found or you do not have access',
  WORKSPACE_EXPIRED: 'This workspace has expired. Please upgrade to continue.',
  WORKSPACE_AT_CAPACITY: 'Workspace is at capacity. Upgrade to add more prompts.',
  TRIAL_EXPIRED: 'Your trial has expired. Please upgrade to continue using this workspace.',
  INVALID_WORKSPACE_ID: 'Invalid workspace ID format',
  WORKSPACE_CREATION_FAILED: 'Failed to create workspace. Please try again.',
  WORKSPACE_UPDATE_FAILED: 'Failed to update workspace. Please try again.',
  QUOTA_EXCEEDED: 'Daily prompt quota exceeded. Upgrade or wait until tomorrow.',
} as const;

// ===========================
// Success Messages
// ===========================

/**
 * Standard success messages for common scenarios
 */
export const SUCCESS_MESSAGES = {
  WORKSPACE_CREATED: 'Workspace created successfully',
  WORKSPACE_UPDATED: 'Workspace updated successfully',
  WORKSPACE_DELETED: 'Workspace deleted successfully',
  QUOTA_UPDATED: 'Workspace quota updated successfully',
  TRIAL_EXTENDED: 'Trial period extended successfully',
  SUBSCRIPTION_ACTIVATED: 'Subscription activated successfully',
} as const;

// ===========================
// Helper Functions
// ===========================

/**
 * Get trial duration in milliseconds
 * Useful for date calculations
 */
export const getTrialDurationMs = (): number => {
  return TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
};

/**
 * Check if quota management is enabled
 */
export const isQuotaManagementEnabled = (): boolean => {
  return ENABLE_QUOTA_MANAGEMENT;
};

/**
 * Check if multi-workspace is enabled
 */
export const isMultiWorkspaceEnabled = (): boolean => {
  return ENABLE_MULTI_WORKSPACE;
};

/**
 * Check if trial extensions are enabled
 */
export const areTrialExtensionsEnabled = (): boolean => {
  return ENABLE_TRIAL_EXTENSIONS;
};

/**
 * Get default workspace name for user
 *
 * @param userName - User's name
 * @returns Generated workspace name
 *
 * @example
 * ```typescript
 * const workspaceName = getDefaultWorkspaceName('John Doe');
 * // Returns: "John Doe's Workspace"
 * ```
 */
export const getDefaultWorkspaceName = (userName: string): string => {
  return DEFAULT_WORKSPACE_NAME_TEMPLATE.replace('{name}', userName);
};

/**
 * Get default company name for user
 *
 * @param userName - User's name
 * @returns Generated company name
 *
 * @example
 * ```typescript
 * const companyName = getDefaultCompanyName('John Doe');
 * // Returns: "John Doe's Company"
 * ```
 */
export const getDefaultCompanyName = (userName: string): string => {
  return DEFAULT_COMPANY_NAME_TEMPLATE.replace('{name}', userName);
};

// ===========================
// Type Exports
// ===========================

/**
 * Status variant type
 */
export type StatusVariant = keyof typeof STATUS_VARIANTS;

/**
 * Status label type
 */
export type StatusLabel = keyof typeof STATUS_LABELS;

/**
 * Quota usage status type
 */
export type QuotaUsageStatus = keyof typeof QUOTA_USAGE_COLORS;

/**
 * Error message key type
 */
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Success message key type
 */
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;
