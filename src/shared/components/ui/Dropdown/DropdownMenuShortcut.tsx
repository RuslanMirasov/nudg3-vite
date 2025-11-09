import type * as React from 'react';
import { cn } from '@/shared/lib/cn';

export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="dropdown-menu-shortcut" className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)} {...props} />;
}
