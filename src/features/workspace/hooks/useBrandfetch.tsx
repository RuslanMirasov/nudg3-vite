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
