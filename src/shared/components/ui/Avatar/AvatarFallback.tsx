import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/lib/cn';

export function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-sm', className)}
      {...props}
    />
  );
}
