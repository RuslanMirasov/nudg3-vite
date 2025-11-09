import type { router } from '@/app/router';
import type { User } from '@/features/auth/types/auth';
import type { AuthContextType } from '@/features/auth/providers/AuthContext';

import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth-api';
import { tokenStorage } from '@/features/auth/lib/token-storage';
import { AuthContext } from '@/features/auth/providers/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
  router: typeof router;
}

export function AuthProvider({ children, router }: AuthProviderProps) {
  const queryClient = useQueryClient();

  /**
   * Loads and caches the current user automatically.
   * React Query caches the response and avoids re-fetching
   * while the data remains fresh.
   */
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = tokenStorage.getToken();
      if (!token) throw new Error('No token');
      return await authApi.getCurrentUser();
    },
    enabled: !!tokenStorage.getToken(), // runs only if a valid token exists
    staleTime: 1000 * 60 * 5, // cache lifetime: 5 minutes
  });

  const isAuthenticated = !!user && !!tokenStorage.getToken();

  /**
   * Handles user authentication.
   * 1. Sends login request to the API.
   * 2. Stores the token in localStorage.
   * 3. Refreshes the cached user data.
   * 4. Redirects to the target page.
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authApi.login({ email, password });

        if (response.user.user_type !== 'company_user') {
          throw new Error('Invalid credentials');
        }

        tokenStorage.setToken(response.access_token, response.expires_in);

        // Refresh cached user data after login
        // await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        await queryClient.setQueryData(['currentUser'], response.user);

        // Redirect to the original or default path
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get('redirect') || '/';

        router.navigate({ to: redirectPath });
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [queryClient, router]
  );

  /**
   * Logs the user out.
   * 1. Removes the authentication token.
   * 2. Clears the cached user data.
   * 3. Redirects to the login page with a redirect parameter.
   */
  const logout = useCallback(() => {
    tokenStorage.clearToken();
    queryClient.removeQueries({ queryKey: ['currentUser'] });

    router.navigate({
      to: '/login',
      search: { redirect: window.location.pathname },
    });
  }, [queryClient, router]);

  /**
   * Forces a user data refresh.
   * Performs a new /auth/me request and updates the cache.
   */
  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [queryClient]);

  /**
   * Periodically checks token expiration every 60 seconds.
   * If the token is expired, triggers a logout.
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (tokenStorage.isTokenExpired()) logout();
    }, 60000); // проверка каждую минуту

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  /**
   * Updates the cached user data manually without an API call.
   * Useful after local profile updates such as name or avatar changes.
   */
  const setUserData = useCallback((userData: User) => queryClient.setQueryData(['currentUser'], userData), [queryClient]);

  // Provides the authentication context to all child components of the application.
  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    setUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
