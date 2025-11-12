import { Outlet } from '@tanstack/react-router';
import { Footer, SidebarInset, SidebarProvider, AppSidebar } from '@/shared/components';
import { OnboardingGuard } from '@/features/onboarding/components/OnboardingGuard';

export default function AppLayout() {
  return (
    <OnboardingGuard>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 61.2)',
            '--header-height': '3.5rem',
          } as React.CSSProperties
        }
      >
        <div className="flex min-h-screen w-full flex-col">
          <div className="flex flex-1">
            <AppSidebar variant="sidebar" />
            <SidebarInset className="flex-1 bg-background">
              <main className="flex-1 bg-background">
                <Outlet />
              </main>
            </SidebarInset>
          </div>
          <Footer />
        </div>
      </SidebarProvider>
    </OnboardingGuard>
  );
}
