import { cn } from '@/shared/lib/cn';

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-xs [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}
