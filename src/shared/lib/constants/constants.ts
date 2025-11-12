/**
 * Application-wide constants for the Nudg3 platform
 */

// Suggested Prompts Configuration
export const PROMPT_LIMITS = {
  /** Number of prompts to fetch for sampling */
  SAMPLE_SIZE: 10,

  /** Maximum total prompts in the pool */
  MAX_POOL_SIZE: 100,

  /** Maximum prompts that can be selected at once */
  MAX_BULK_SELECT: 50,

  /** Minimum quality score (0-1 scale) */
  MIN_QUALITY_SCORE: 0,

  /** Maximum quality score (0-1 scale) */
  MAX_QUALITY_SCORE: 1,

  /** Default maximum prompts per workspace */
  DEFAULT_MAX_PROMPTS: 50,
} as const;

// Rate Limiting Display
export const RATE_LIMITS = {
  /** Requests per minute per workspace */
  PER_MINUTE: 60,

  /** Requests per hour per workspace */
  PER_HOUR: 300,
} as const;

// Toast Duration Configuration
export const TOAST_DURATIONS = {
  /** Short toast message (success/info) */
  SHORT: 3000,

  /** Default toast duration */
  DEFAULT: 5000,

  /** Long toast with action (requires user attention) */
  LONG: 10000,
} as const;

// API Configuration
export const API_CONFIG = {
  /** Default request timeout in milliseconds */
  TIMEOUT: 30000,

  /** Number of retry attempts for failed requests */
  MAX_RETRIES: 3,
} as const;

// Tag color mappings
export const TAG_COLOR_MAPPINGS: { [key: string]: string } = {
  // Common tags
  tech: 'bg-blue-100 text-blue-800',
  budget: 'bg-green-100 text-green-800',
  premium: 'bg-purple-100 text-purple-800',
  gaming: 'bg-red-100 text-red-800',
  business: 'bg-indigo-100 text-indigo-800',
  student: 'bg-cyan-100 text-cyan-800',
  creative: 'bg-pink-100 text-pink-800',
  portable: 'bg-emerald-100 text-emerald-800',
  performance: 'bg-orange-100 text-orange-800',
  desktop: 'bg-pink-100 text-pink-800',

  // System tags
  suggested: 'bg-violet-100 text-violet-800',
  'ai-generated': 'bg-blue-100 text-blue-800',
  'manually-deactivated': 'bg-gray-100 text-gray-800',

  // Categories
  brand_discovery: 'bg-green-100 text-green-800',
  purchase_intent: 'bg-orange-100 text-orange-800',
  competitive_intelligence: 'bg-purple-100 text-purple-800',
  brand_reputation: 'bg-red-100 text-red-800',
};

// Default colors for tags not in the mapping
export const DEFAULT_TAG_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-red-100 text-red-800',
  'bg-indigo-100 text-indigo-800',
  'bg-yellow-100 text-yellow-800',
  'bg-cyan-100 text-cyan-800',
  'bg-pink-100 text-pink-800',
  'bg-emerald-100 text-emerald-800',
  'bg-orange-100 text-orange-800',
];
