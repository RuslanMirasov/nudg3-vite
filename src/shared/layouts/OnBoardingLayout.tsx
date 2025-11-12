import { Outlet } from '@tanstack/react-router';

export default function OnBoardingLayout() {
  return (
    <main className="flex-1 bg-background">
      <Outlet />
    </main>
  );
}
