// import { useState, useEffect, useMemo } from 'react';
// import { getLogoDevUrl, getBrandfetchUrl, getBrandfetchFallback, getBrandColor, cleanDomain } from '@/features/workspace/lib/brandfetch';
// import { brandLogoApi } from '@/features/workspace/api/workspace-api';
// import { tokenStorage } from '@/features/auth/lib/token-storage';
// import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';

// interface UseBrandfetchProps {
//   domain?: string;
//   name: string;
// }

// interface BrandfetchResult {
//   src: string | null;
//   fallback: string;
//   color: string;
//   isLoading: boolean;
//   hasError: boolean;
// }

// const logoCache = new Map<string, { src: string | null; hasError: boolean; timestamp: number }>();
// const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// export function useBrandfetch({ domain, name }: UseBrandfetchProps): BrandfetchResult {
//   const [currentSrc, setCurrentSrc] = useState<string | null>(null);
//   const [hasError, setHasError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Get workspace context and auth token
//   const { selectedWorkspace } = useWorkspace();
//   const token = tokenStorage.getToken();

//   // Get API tokens from env (for frontend fallback)
//   const logoDevToken = import.meta.env.VITE_LOGO_DEV_TOKEN || '';
//   const brandfetchClientId = import.meta.env.VITE_BRANDFETCH_CLIENT_ID || '';

//   // Clean domain
//   const cleanedDomain = useMemo(() => {
//     return domain ? cleanDomain(domain) : '';
//   }, [domain]);

//   // Generate logo URLs in priority order
//   // NOTE: Removed Google Favicons from frontend waterfall to comply with CSP policy.
//   // Backend handles the complete provider chain including Google Favicons as final fallback.
//   // Frontend only tests Logo.dev and Brandfetch (both whitelisted in CSP).
//   const logoUrls = useMemo(() => {
//     if (!cleanedDomain) return [];

//     const urls: string[] = [];

//     try {
//       if (logoDevToken) {
//         urls.push(getLogoDevUrl(cleanedDomain, logoDevToken));
//       }

//       // 2. Brandfetch (BACKUP - for sources, whitelisted in CSP)
//       if (brandfetchClientId) {
//         urls.push(getBrandfetchUrl(cleanedDomain, brandfetchClientId));
//       }

//       // NOTE: Google Favicons removed from frontend
//       // The backend (citation_service.py) handles Google Favicons as a final fallback,
//       // ensuring CSP compliance by not making direct browser requests to google.com
//     } catch (error) {
//       console.error('[Logo Service] Error generating URLs:', error);
//     }

//     return urls;
//   }, [cleanedDomain, logoDevToken, brandfetchClientId]);

//   useEffect(() => {
//     if (!cleanedDomain) {
//       setCurrentSrc(null);
//       setHasError(false);
//       setIsLoading(false);
//       return;
//     }

//     const cacheKey = cleanedDomain;
//     const cached = logoCache.get(cacheKey);
//     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
//       console.log('[Logo Service] Using frontend cached result for:', cleanedDomain);
//       setCurrentSrc(cached.src);
//       setHasError(cached.hasError);
//       setIsLoading(false);
//       return;
//     }

//     let cancelled = false;
//     const fetchId = Date.now(); // Unique ID for this fetch to prevent race conditions
//     setIsLoading(true);

//     const fetchLogo = async (id: number) => {
//       if (selectedWorkspace?.id && token) {
//         try {
//           const result = await brandLogoApi.getLogoByDomain(selectedWorkspace.id, cleanedDomain);

//           if (cancelled || id !== fetchId) return;

//           if (result.icon_url) {
//             // Successfully fetched from backend
//             setCurrentSrc(result.icon_url);
//             setHasError(false);
//             setIsLoading(false);
//             logoCache.set(cacheKey, { src: result.icon_url, hasError: false, timestamp: Date.now() });
//             return;
//           }
//         } catch {
//           // Continue to frontend fallback
//         }
//       }

//       if (cancelled || id !== fetchId) return;

//       if (logoUrls.length === 0) {
//         setCurrentSrc(null);
//         setHasError(true);
//         setIsLoading(false);
//         logoCache.set(cacheKey, { src: null, hasError: true, timestamp: Date.now() });
//         return;
//       }

//       for (let i = 0; i < logoUrls.length; i++) {
//         if (cancelled || id !== fetchId) return;

//         const url = logoUrls[i];
//         if (!url) continue;

//         const success = await testUrl(url);

//         if (cancelled || id !== fetchId) return;

//         if (success) {
//           setCurrentSrc(url ?? null);
//           setHasError(false);
//           setIsLoading(false);
//           logoCache.set(cacheKey, { src: url ?? null, hasError: false, timestamp: Date.now() });
//           return;
//         }
//       }

//       setCurrentSrc(null);
//       setHasError(true);
//       setIsLoading(false);
//       logoCache.set(cacheKey, { src: null, hasError: true, timestamp: Date.now() });
//     };

//     const testUrl = (url: string): Promise<boolean> => {
//       return new Promise(resolve => {
//         const img = new Image();
//         const timeout = setTimeout(() => {
//           resolve(false);
//         }, 3000);

//         img.onload = () => {
//           clearTimeout(timeout);
//           resolve(true);
//         };

//         img.onerror = () => {
//           clearTimeout(timeout);
//           resolve(false);
//         };

//         img.src = url;
//       });
//     };

//     fetchLogo(fetchId);

//     return () => {
//       cancelled = true;
//     };
//   }, [cleanedDomain, selectedWorkspace, token, logoUrls]);

//   const fallback = useMemo(() => getBrandfetchFallback(name || domain || ''), [name, domain]);
//   const color = useMemo(() => getBrandColor(domain || name || ''), [domain, name]);

//   return {
//     src: hasError ? null : currentSrc,
//     fallback,
//     color,
//     isLoading,
//     hasError: hasError || (!currentSrc && !isLoading && !!domain),
//   };
// }

// export const brandfetchCache = {
//   clear: () => logoCache.clear(),
//   invalidate: (domain: string) => logoCache.delete(cleanDomain(domain)),
//   size: () => logoCache.size,
//   prune: () => {
//     const now = Date.now();
//     Array.from(logoCache.entries()).forEach(([key, value]) => {
//       if (now - value.timestamp > CACHE_DURATION) {
//         logoCache.delete(key);
//       }
//     });
//   },
// };

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLogoDevUrl, getBrandfetchUrl, getBrandfetchFallback, getBrandColor, cleanDomain } from '@/features/workspace/lib/brandfetch';
import { brandLogoApi } from '@/features/workspace/api/workspace-api';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';

interface UseBrandfetchProps {
  domain?: string;
  name: string;
}

interface BrandfetchResult {
  src: string | null;
  fallback: string;
  color: string;
  isLoading: boolean;
  hasError: boolean;
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useBrandfetch({ domain, name }: UseBrandfetchProps): BrandfetchResult {
  const { selectedWorkspace } = useWorkspace();
  const logoDevToken = import.meta.env.VITE_LOGO_DEV_TOKEN || '';
  const brandfetchClientId = import.meta.env.VITE_BRANDFETCH_CLIENT_ID || '';
  const cleanedDomain = useMemo(() => (domain ? cleanDomain(domain) : ''), [domain]);

  const logoUrls = useMemo(() => {
    if (!cleanedDomain) return [];

    const urls: string[] = [];

    try {
      if (logoDevToken) urls.push(getLogoDevUrl(cleanedDomain, logoDevToken));
      if (brandfetchClientId) urls.push(getBrandfetchUrl(cleanedDomain, brandfetchClientId));
    } catch (error) {
      console.error('[Logo Service] Error generating URLs:', error);
    }

    return urls;
  }, [cleanedDomain, logoDevToken, brandfetchClientId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['brandLogo', selectedWorkspace?.id, cleanedDomain],
    enabled: Boolean(selectedWorkspace?.id && cleanedDomain),
    staleTime: CACHE_DURATION,
    queryFn: async () => {
      if (!selectedWorkspace?.id || !cleanedDomain) return null;

      try {
        const result = await brandLogoApi.getLogoByDomain(selectedWorkspace.id, cleanedDomain);
        if (result?.icon_url) return result.icon_url;
      } catch {
        // Backend returns nothing — go to fallback-path
      }

      for (const url of logoUrls) {
        if (await testUrl(url)) return url;
      }

      return null;
    },
  });

  const fallback = useMemo(() => getBrandfetchFallback(name || domain || ''), [name, domain]);
  const color = useMemo(() => getBrandColor(domain || name || ''), [domain, name]);

  return {
    src: isError ? null : data ?? null,
    fallback,
    color,
    isLoading,
    hasError: isError || (!data && !isLoading && !!domain),
  };
}

async function testUrl(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(false), 3000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}
