import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { onboardingApi } from '@/features/onboarding/api/onboarding-api';
import { useWorkspace } from '@/features/workspace/hooks/useWorkspace';
import { FullPageLoading } from '@/shared/components';

//OnboardingGuard
export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { selectedWorkspace } = useWorkspace();
  const workspaceId = selectedWorkspace?.id;

  const {
    data: status,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['onboardingStatus', workspaceId],
    queryFn: () => onboardingApi.getOnboardingStatus(workspaceId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (status?.needs_setup) {
      navigate({ to: '/onboarding/setup' });
    }
  }, [status, navigate]);

  if (isLoading || isFetching) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
};
