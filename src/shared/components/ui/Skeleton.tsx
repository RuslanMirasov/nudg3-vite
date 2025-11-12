import { cn } from '@/shared/lib/cn';

export function Skeleton({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'default' | 'chart' | 'avatar' | 'text' | 'button';
}) {
  const variants = {
    default: 'rounded-md',
    chart: 'rounded-lg',
    avatar: 'rounded-full',
    text: 'rounded-sm',
    button: 'rounded-lg',
  };

  return <div data-slot="skeleton" className={cn(variants[variant], 'bg-gray-200 dark:bg-gray-900 animate-pulse', className)} {...props} />;
}
