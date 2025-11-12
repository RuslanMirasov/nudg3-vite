import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('bg-card text-card-foreground flex flex-col gap-3 rounded-lg border py-3', className)} {...props} />;
}
