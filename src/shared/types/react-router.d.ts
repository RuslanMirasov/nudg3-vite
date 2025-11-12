import type { router } from '@/app/router';
import type { QueryClient } from '@tanstack/react-query';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export interface RouterContext {
  queryClient: QueryClient;
}
