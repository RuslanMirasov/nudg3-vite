/**
 * Provider display name utilities
 *
 * Maps internal provider names to user-friendly display names
 */

const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  // Main providers
  openai: 'ChatGPT',
  perplexity: 'Perplexity',
  dataforseo: 'Google AIO',
  anthropic: 'Claude',
  google: 'Gemini',

  // Premium providers
  deepseek: 'DeepSeek',
  llama: 'Llama',
  grok: 'Grok',
  copilot: 'Copilot',

  // Alternative names/aliases
  'Google AIO': 'Google AIO',
  ChatGPT: 'ChatGPT',
};

/**
 * Get display name for a provider
 *
 * @param provider - Internal provider name (e.g., 'openai', 'dataforseo')
 * @returns User-friendly display name (e.g., 'ChatGPT', 'Google AIO')
 */
export function getProviderDisplayName(provider: string): string {
  const normalized = provider.toLowerCase();
  return PROVIDER_DISPLAY_NAMES[normalized] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

/**
 * Map an array of provider names to display labels
 *
 * IMPORTANT: This function now sends display names as values to match database storage.
 * The database stores "Google AIO", "ChatGPT", "Gemini" (not internal names).
 *
 * @param providers - Array of provider names (internal or display)
 * @returns Array of objects with value and label properties (both use display names)
 */
export function mapProvidersToOptions(providers: string[]): Array<{ value: string; label: string }> {
  return providers.map(provider => ({
    value: getProviderDisplayName(provider), // Send display name to backend
    label: getProviderDisplayName(provider), // Show display name to user
  }));
}
