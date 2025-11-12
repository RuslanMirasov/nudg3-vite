import { LoadingSpinner } from '@/shared/components';
import { cn } from '@/shared/lib/cn';

interface FullPageLoadingProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export function FullPageLoading({ message = 'Loading...', showSpinner = true, className }: FullPageLoadingProps) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-4">
        {showSpinner && <LoadingSpinner size="lg" />}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
