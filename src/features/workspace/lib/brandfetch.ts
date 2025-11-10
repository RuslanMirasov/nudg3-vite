/**
 * Logo Fetching Utilities with Waterfall Fallback
 *
 * Supports multiple logo providers with automatic fallback:
 * 1. Logo.dev (PRIMARY) - 628M domains, free with attribution
 * 2. Brandfetch (BACKUP) - 500K requests/month free
 * 3. Google Favicons (TERTIARY) - Unlimited free
 *
 * Docs:
 * - Logo.dev: https://docs.logo.dev
 * - Brandfetch: https://docs.brandfetch.com/docs/logo-api
 */

/**
 * Get Logo.dev URL for a given domain
 *
 * @param domain - Clean domain (e.g., "apple.com")
 * @param token - Logo.dev token (from env: NEXT_PUBLIC_LOGO_DEV_TOKEN)
 * @returns Logo.dev CDN URL for the logo
 */
export function getLogoDevUrl(domain: string, token: string): string {
  if (!domain || !token) {
    throw new Error('Domain and token are required for Logo.dev');
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0];

  return `https://img.logo.dev/${cleanDomain}?token=${token}`;
}

/**
 * Get Brandfetch logo URL for a given domain
 *
 * @param domain - Clean domain (e.g., "apple.com", not "https://www.apple.com")
 * @param clientId - Brandfetch client ID (from env: NEXT_PUBLIC_BRANDFETCH_CLIENT_ID)
 * @param width - Optional width in pixels (default: auto)
 * @param height - Optional height in pixels (default: auto)
 * @returns Brandfetch CDN URL for the logo
 */
export function getBrandfetchUrl(domain: string, clientId: string, width?: number, height?: number): string {
  if (!domain || !clientId) {
    throw new Error('Domain and clientId are required for Brandfetch');
  }

  // Clean domain: remove protocol, www, and trailing slashes
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0]; // Remove any path

  // Base URL
  const url = `https://cdn.brandfetch.io/${cleanDomain}`;

  // Add query params
  const params = new URLSearchParams({ c: clientId });
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());

  return `${url}?${params.toString()}`;
}

/**
 * Get Google Favicons URL for a given domain
 *
 * @param domain - Clean domain (e.g., "apple.com")
 * @param size - Icon size (default: 128)
 * @returns Google Favicons URL
 */
export function getGoogleFaviconUrl(domain: string, size: number = 128): string {
  if (!domain) {
    throw new Error('Domain is required for Google Favicons');
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('/')[0];

  return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
}

/**
 * Get fallback letter for domain when logo fails to load
 *
 * @param name - Brand/domain name
 * @returns Single uppercase letter
 */
export function getBrandfetchFallback(name: string): string {
  if (!name) return '?';

  // For domains, try to get meaningful abbreviation
  if (name.includes('.')) {
    const cleanDomain = (
      name
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('.')[0] || ''
    ).trim();

    if (cleanDomain.length <= 2) {
      return cleanDomain.toUpperCase();
    }

    return cleanDomain.charAt(0).toUpperCase();
  }

  // For regular names, take first character
  return name.charAt(0).toUpperCase();
}

/**
 * Get brand color for fallback avatar
 *
 * @param text - Domain or brand name
 * @returns HSL color string
 */
export function getBrandColor(text: string): string {
  const cleanText = text
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  // Predefined colors for common brands
  const brandColors: Record<string, string> = {
    'youtube.com': '#FF0000',
    'google.com': '#4285f4',
    'facebook.com': '#1877f2',
    'twitter.com': '#1da1f2',
    'linkedin.com': '#0077b5',
    'github.com': '#333333',
    'stackoverflow.com': '#F48024',
    'reddit.com': '#FF4500',
    'medium.com': '#00AB6C',
    'wikipedia.org': '#0066CC',
    'amazon.com': '#FF9900',
    'microsoft.com': '#00BCF2',
    'apple.com': '#000000',
    'netflix.com': '#E50914',
    'spotify.com': '#1DB954',
  };

  const brandColor = brandColors[cleanText];
  if (brandColor) return brandColor;

  // Generate color from text hash
  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}

/**
 * Clean domain string for Brandfetch
 *
 * @param domain - Raw domain string (may include protocol, www, path)
 * @returns Clean domain suitable for Brandfetch
 */
export function cleanDomain(domain: string): string {
  if (!domain) return '';

  return (
    domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .split('/')[0] || ''
  );
}
