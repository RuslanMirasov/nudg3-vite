import { createRouter, createRootRoute, createRoute, redirect, Outlet } from '@tanstack/react-router';
import { tokenStorage } from '@/features/auth/lib/token-storage';

//Layouts
import AppLayout from '@/shared/layouts/AppLayout';

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

const checkAuth = () => {
  const token = tokenStorage.getToken();
  if (!token || tokenStorage.isTokenExpired()) return false;
  return true;
};

const redirectTo = (location: { pathname: string }) => {
  if (!checkAuth()) {
    throw redirect({
      to: '/login',
      search: { redirect: location.pathname },
    });
  }
};

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Privat route
const privatRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  beforeLoad: ({ location }) => redirectTo(location),
  component: AppLayout,
});

const privateRoutes = privatePages.map(({ path, component }) =>
  createRoute({
    getParentRoute: () => privatRoute,
    path,
    component,
  })
);

// Login page
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

// Create route tree
const routeTree = rootRoute.addChildren([privatRoute.addChildren(privateRoutes), loginRoute]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
  },
});
