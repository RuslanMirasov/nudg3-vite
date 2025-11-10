import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { Toaster } from '@/shared/components';
import { ThemeProvider } from '@/shared/providers/theme-provider';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';
import { WorkspaceProvider } from '@/features/workspace/providers/WorkspaceProvider';
import { queryClient } from '@/shared/lib/queryClient';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider router={router}>
          <WorkspaceProvider>
            <RouterProvider router={router} context={{ queryClient }} />
            <Toaster position="top-center" />
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
