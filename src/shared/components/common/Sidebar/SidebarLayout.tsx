import type * as React from 'react';
import { cn } from '@/shared/lib/cn';

export function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background max-w-full',
        'peer-data-[variant=inset]:min-h-[calc(100svh-var(--spacing-4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
        className
      )}
      {...props}
    />
  );
}
