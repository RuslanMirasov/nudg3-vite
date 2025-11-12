import { cn } from '@/shared/lib/cn';

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center px-4 [.border-t]:pt-4', className)} {...props} />;
}
