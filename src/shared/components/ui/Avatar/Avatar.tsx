import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/lib/cn';

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-sm', className)} {...props} />;
}
