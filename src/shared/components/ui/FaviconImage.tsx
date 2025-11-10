import { useState } from 'react';
import { useBrandfetch } from '@/features/workspace/hooks/useBrandfetch';

interface FaviconImageProps {
  domain?: string;
  name?: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function FaviconImage({ domain, name, size = 32, className = '', alt }: FaviconImageProps) {
  const [localError, setLocalError] = useState(false);
  const { src, fallback, color, hasError } = useBrandfetch({
    domain: domain || '',
    name: name || domain || '',
  });

  const handleError = () => {
    setLocalError(true);
  };

  // Show fallback if no src OR if both hook error and local error
  const showFallback = !src || (hasError && localError);

  if (showFallback) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-sm font-semibold text-white ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: Math.max(size * 0.35, 8),
        }}
        title={alt || `${name || domain} favicon`}
      >
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || `${name || domain} favicon`}
      width={size}
      height={size}
      className={`rounded-sm ${className}`}
      onError={handleError}
      style={{ objectFit: 'contain' }}
      loading="lazy"
    />
  );
}
