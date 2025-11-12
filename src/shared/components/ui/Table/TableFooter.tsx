import { cn } from '@/shared/lib/cn';

export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot data-slot="table-footer" className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)} {...props} />;
}
