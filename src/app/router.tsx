import { createRouter, createRootRouteWithContext, createRoute, redirect, Outlet } from '@tanstack/react-router';
import { tokenStorage } from '@/features/auth/lib/token-storage';
import type { RouterContext } from '@/shared/types/react-router';

//Layouts
import AppLayout from '@/shared/layouts/AppLayout';
import OnBoardingLayout from '@/shared/layouts/OnBoardingLayout';

// Pages
import {
  LoginPage,
  DashboardPage,
  ChatResponsesPage,
  SourcesPage,
  PromptsPage,
  CompetitorsPage,
  WorkspacesPage,
  WorkspaceSettingsPage,
  BillingPage,
  OnBoardingSetupPage,
} from '@/pages';

const privatePages = [
  { path: '/', component: DashboardPage },
  { path: '/chat-responses', component: ChatResponsesPage },
  { path: '/sources', component: SourcesPage },
  { path: '/prompts', component: PromptsPage },
  { path: '/competitors', component: CompetitorsPage },
  { path: '/workspaces', component: WorkspacesPage },
  { path: '/workspace', component: WorkspaceSettingsPage },
  { path: '/billing', component: BillingPage },
] as const;

const onboardPages = [{ path: '/onboarding/setup', component: OnBoardingSetupPage }] as const;

const checkAuth = () => {
  const token = tokenStorage.getToken();
  if (!token || tokenStorage.isTokenExpired()) return false;
  return true;
};

const redirectTo = async (location: { pathname: string }) => {
  if (!checkAuth()) {
    throw redirect({
      to: '/login',
      search: { redirect: location.pathname },
    });
  }
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

const privatRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  async beforeLoad({ location }) {
    await redirectTo(location);
  },
  component: AppLayout,
});

const privateRoutes = privatePages.map(({ path, component }) =>
  createRoute({
    getParentRoute: () => privatRoute,
    path,
    component,
  })
);

const onboardingPrivatRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'onboarding-layout',
  async beforeLoad({ location }) {
    await redirectTo(location);
  },
  component: OnBoardingLayout,
});

const onboardingRoutes = onboardPages.map(({ path, component }) =>
  createRoute({
    getParentRoute: () => onboardingPrivatRoute,
    path,
    component,
  })
);

// Login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect: string } => ({
    redirect: (search['redirect'] as string) || '/',
  }),
  beforeLoad: ({ search }: { search: { redirect: string } }) => {
    if (checkAuth()) {
      throw redirect({ to: search.redirect || '/' });
    }
  },
  component: LoginPage,
});

// --- Route tree
const routeTree = rootRoute.addChildren([privatRoute.addChildren(privateRoutes), onboardingPrivatRoute.addChildren(onboardingRoutes), loginRoute]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
  },
});
